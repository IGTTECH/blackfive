// admin-guard.js
firebase.auth().onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const adminDoc = await firebase.firestore().collection("admins").doc(user.uid).get();
  if (!adminDoc.exists || !adminDoc.data().isAdmin) {
    window.location.href = "verify.html";
  }
});
