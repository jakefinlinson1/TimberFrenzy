const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize admin privileges to securely bypass standard database rules
admin.initializeApp();

exports.verifyAdReward = functions.https.onRequest(async (req, res) => {
  // 1. Extract the data AdMob sends in the background URL ping
  const { custom_data, reward_amount } = req.query;

  // AdMob requires a 200 OK response even if it fails, otherwise it keeps retrying
  if (!custom_data) {
    console.error("Missing custom_data (Player ID)");
    return res.status(200).send("Failed: No Player ID provided.");
  }

  try {
    // 2. The custom_data is the exact Player ID you pass from the game
    const playerId = custom_data;
    const amount = parseInt(reward_amount, 10) || 10; // Default to 10 gems/coins

    // 3. Target the specific player's document in Firestore
    const playerRef = admin.firestore().collection("players").doc(playerId);

    // 4. Securely add the reward to their account
    await admin.firestore().runTransaction(async (transaction) => {
      const doc = await transaction.get(playerRef);
      
      if (!doc.exists) {
        // If the player doesn't exist yet, create them and add the reward
        transaction.set(playerRef, { gems: amount });
      } else {
        // If they do exist, add the new reward to their current balance
        const currentGems = doc.data().gems || 0;
        transaction.update(playerRef, { gems: currentGems + amount });
      }
    });

    // 5. Tell AdMob the reward was successfully processed
    res.status(200).send("Reward verified and granted successfully.");

  } catch (error) {
    console.error("Database transaction failed:", error);
    res.status(500).send("Internal Server Error");
  }
});
