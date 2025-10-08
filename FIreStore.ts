import { useState } from "react";

import { collection, getDocs } from "firebase/firestore";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { DB } from "./fireBaseConfig";

const FireStore = () => {
  const [data, setData] = useState<string[]>([]);

  const FetchWords = async (level: "easy") => {
    const cacheKey = `words_${level}`;
    //check local cache
    const cacheData = await AsyncStorage.getItem(cacheKey);
    if (cacheData) {
      console.log("Using cached data");
      return JSON.parse(cacheData);
    }
    //fetch data from Firestore
    console.log("fetching from FireStore");

    const Snapshot = await getDocs(collection(DB, level));
    setData(Snapshot.docs.map((doc) => doc.data().word));
    //save to local cache
    await AsyncStorage.setItem(
      cacheKey,
      JSON.stringify(Snapshot.docs.map((doc) => doc.data().word))
    );
    console.log(data);
  };
  return { FetchWords, data };
};
export default FireStore;
