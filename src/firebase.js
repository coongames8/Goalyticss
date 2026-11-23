import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection, doc, getDoc, getDocs, getFirestore, limit, query, updateDoc, where, orderBy, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBqHfrwEOoYkTJzi4XQsFfh4M3xjg8e6bs",
  authDomain: "goalytics-5c239.firebaseapp.com",
  projectId: "goalytics-5c239",
  storageBucket: "goalytics-5c239.firebasestorage.app",
  messagingSenderId: "260589878215",
  appId: "1:260589878215:web:5a0c0fdf9dab435d4fb7e2",
  measurementId: "G-KK0F3K4954"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

const memoryCache = new Map();
const CACHE_PREFIX = "goalytics_";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const invalidateCache = (key) => {
  memoryCache.delete(key);
  try { localStorage.removeItem(CACHE_PREFIX + key); } catch {}
};

const readCache = (key) => {
  if (memoryCache.has(key)) return memoryCache.get(key);
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { t, v } = JSON.parse(raw);
    if (Date.now() - t > CACHE_TTL) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    memoryCache.set(key, v);
    return v;
  } catch {
    return null;
  }
};

const writeCache = (key, value) => {
  memoryCache.set(key, value);
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ t: Date.now(), v: value }));
  } catch {
    // storage full or unavailable; memory cache still applies
  }
};

export const signInUser = (email, password, setError) => {
  signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
    const user = userCredential.user;
    alert(`User with ${user.email} has logged in successfully`);
  }).catch(async (error) => {
    const errorMessage = await error.message;
    setError(errorMessage);
  });
  return;
}

export const registerUser = (username, email, password, setSuccess, setError) => {
  createUserWithEmailAndPassword(auth, email, password).then(async (userCredential) => {
    const user = userCredential.user;
    const userDocRef = doc(db, "users", user.email);
    await setDoc(userDocRef, {
      email: user.email,
      username: username,
      isPremium: false,
      subscription: null
    }, { merge: true }).then(async (response) => {
      setSuccess(`User with ${user.email} has been registered successfully`)
    }).catch(async (error) => {
      const errorMessage = await error.message;
      setError(errorMessage);
    });
  }).catch(async (error) => {
    const errorMessage = await error.message;
    setError(errorMessage);
  });
  return;
}

export const updateUser = async (userId, isPremium, subscription, subDate) => {
  const usercollref = doc(db, 'users', userId);
  try {
    await updateDoc(usercollref, {
      isPremium,
      subscription,
      subDate
    }, { merge: true }); // Will create the doc if it doesn't exist, or update it;
  } catch (error) {
    console.error("Error updating user:", error.message);
  }
};


export const getUser = async (userId, setUserData) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (userDoc.exists()) {
    setUserData(userDoc.data());
  } else {
    console.error("User not found");
  }
};


export const getAllusers = async (setUsers, setLoading) => {
  const cacheKey = "all_users";
  const cached = readCache(cacheKey);
  if (cached) {
    setUsers(cached);
    setLoading(false);
  }
  setLoading(true);
  const usersCollectionRef = collection(db, "users");

  const users = [];
  try {
    const data = await getDocs(usersCollectionRef);
    data.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    setUsers(users);
    writeCache(cacheKey, users);
  } catch (err) {
    if (!cached) setUsers([]);
  } finally {
    setLoading(false);
  }
};

export const addContact = async (data, setSuccess, setError) => {
  const contactsDocRef = collection(db, "contacts");
  await addDoc(contactsDocRef, { ...data, responded: false }).then(async (userCredential) => {
    setSuccess("We will get back to you as soon as possible.")
  }).catch(async (error) => {
    const errorMessage = await error.message;
    setError(errorMessage);
  });
};


export const addTip = async (data, setError, setLoading) => {
  setLoading(true);
  const timestamp = Date.now(); // milliseconds since epoch
  //const customId = (data.home.trim() + data.away.trim() + data.date.split("/").join("") + timestamp).toLowerCase();
  const customId = (data.home + data.away + data.date.split("/").join("")).replace(/\s+/g, "");
  const tipsDocRef = doc(db, "tips", customId);

  const pick = data.pick.trim().toLowerCase();

  let type = "1X2";
  
  switch (pick) {
    case "w1":
    case "w2":
    case "x":
      type = "1X2";
      break;
  
    case "ov 2.5":
    case "ov2.5":
    case "un 2.5":
    case "un2.5":
      type = "OV_UN";
      break;
  
    case "gg":
    case "g-g":
      type = "GG";
      break;
  
    case "dc1or2":
    case "dc1orx":
    case "dc2orx":
    case "dc 12":
    case "dc 1x":
    case "dc 2x":
    case "dc12":
    case "dc1x":
    case "dc2x":
      type = "DC";
      break;
  
    default:
      type = "CS"; // Or whatever fallback you prefer
      break;
  }
  


  invalidateCache("all_tips");
  invalidateCache(`tips_${data.date}_${100}`);
  await setDoc(tipsDocRef, {
    ...data
  }).then(async () => {
    try {
      const response = await axios.post('https://goalkings-api-production.up.railway.app/api/tips', {id: customId, type, ...data});
    } catch (error) {
      // Axios throws an error for any non-2xx status code
      console.error('Error:', error.response?.data || error.message);
    }
  }).then(async (docRef) => {
    alert("tip added")
    window.location.replace(`/`);
  }).catch(async (error) => {
    setError(error.message);
    setLoading(false);
  });
  setLoading(false)
};

export const updateTip = async (id, data, setError, setLoading, setData) => {
  setLoading(true);
  const tipsDocRef = doc(db, "tips", id);
  invalidateCache("all_tips");
  await updateDoc(tipsDocRef, {
    ...data
  }).then(async () => {
    try {
      const response = await axios.patch(`https://goalkings-api-production.up.railway.app/api/tips/${id}`, {...data});

      console.log(response.data); // The newly created resource
    } catch (error) {
      // Axios throws an error for any non-2xx status code
      console.error('Error:', error.response?.data || error.message);
    }
  }).then(async (docRef) => {
    alert("Tip updated successfully!");

    const docSnap = await getDoc(tipsDocRef); // Fetch the document

    if (docSnap.exists()) {
      setData(docSnap.data());
      return docSnap.data();
    } else {
      return null;
    }
  }).catch(async (error) => {
    setError(error.message);
    setLoading(false);
  });
  setLoading(false)
};


export const getTips = async (pagination, setTips, setLoading, currentDate) => {
  const cacheKey = `tips_${currentDate}_${pagination}`;
  const cached = readCache(cacheKey);
  if (cached) {
    setTips(cached);
    setLoading(false);
  }
  setLoading(true);
  const tipsCollectionRef = collection(db, "tips");
  var q = query(tipsCollectionRef, where("date", "==", currentDate), limit(pagination));

  const tips = [];
  try {
    const data = await getDocs(q);
    data.forEach((doc) => {
      tips.push({ id: doc.id, ...doc.data() });
    });
    setTips(tips);
    writeCache(cacheKey, tips);
  } catch (err) {
    if (!cached) setTips([]);
  } finally {
    setLoading(false);
  }
};

export const getAllTips = async (setTips, setLoading) => {
  const cacheKey = "all_tips";
  const cached = readCache(cacheKey);
  if (cached) {
    setTips(cached);
    setLoading(false);
  }
  setLoading(true);
  const tipsCollectionRef = collection(db, "tips");
  var q = query(tipsCollectionRef, orderBy("date"));

  const tips = [];
  try {
    const data = await getDocs(q);
    data.forEach((doc) => {
      tips.push({ id: doc.id, ...doc.data() });
    });
    const sorted = tips.reverse();
    setTips(sorted);
    writeCache(cacheKey, sorted);
  } catch (err) {
    if (!cached) setTips([]);
  } finally {
    setLoading(false);
  }
};

export const getWonTips = async (pagination, setTips) => {
  const cacheKey = `won_tips_${pagination}`;
  const cached = readCache(cacheKey);
  if (cached) {
    setTips(cached);
    return;
  }
  const tipsCollectionRef = collection(db, "tips");
  const q = query(
    tipsCollectionRef,
    where("won", "==", "won"),
    where("premium", "==", true), // Only include premium tips
    limit(pagination)
  );
  try {
    const data = await getDocs(q);
    const tips = [];
    data.forEach((doc) => {
      tips.push({ id: doc.id, ...doc.data() });
    });

    const sortedTips = tips.sort((a, b) => new Date(b.date) - new Date(a.date));
    setTips(sortedTips);
    writeCache(cacheKey, sortedTips);
  } catch (err) {
    console.error("Error fetching tips:", err);
  }
};
