import React, { useState, useEffect } from "react";
import { ExpoLinksView } from '@expo/samples';
import firebase from "firebase/app";
import "firebase/auth";
import db from "../db.js";
import {
  Image,
  Platform,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Picker
} from "react-native";

export default function LinksScreen() {
  const [users, setUsers] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const user = db
      .collection(`users`)
      .doc(firebase.auth().currentUser.uid)
      .onSnapshot(docSnapshot => {
        console.log("user snapshot data", docSnapshot.data());
        setUser(docSnapshot.data());
      });

    db.collection("users").onSnapshot(querySnapshot => {
      const users = [];
      querySnapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() });
      });
      console.log(" Current users: ", users);
      setUsers([...users]);
    });
  }, []);

  const addFriend = async (id) => {
    const friends = [...user.friends, id]
    await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .set({
        displayName: user.displayName,
        photoURL: user.photoURL,
        location: user.location,
        friends,
        blockedList: user.blockedList,
        publicUser: user.publicUser,
        online: user.online
      });
  }
  const removeFriend = async (id) => {
    const friends = user.friends.filter(u => u.id !== id)
    await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .set({
        displayName: user.displayName,
        photoURL: user.photoURL,
        location: user.location,
        friends,
        blockedList: user.blockedList,
        publicUser: user.publicUser,
        online: user.online
      });
  }
  const addToBlockedList = async (id) => {
    const blockedList = [...user.blockedList, id]
    await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .set({
        displayName: user.displayName,
        photoURL: user.photoURL,
        location: user.location,
        friends: user.friends,
        blockedList,
        publicUser: user.publicUser,
        online: user.online
      });
  }
  const removeFromBlockedList = async (id) => {
    const blockedList = user.blockedList.filter(u => u.id !== id)
    await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .set({
        displayName: user.displayName,
        photoURL: user.photoURL,
        location: user.location,
        friends: user.friends,
        blockedList,
        publicUser: user.publicUser,
        online: user.online
      });
  }


  return (
    <ScrollView style={styles.container}>
      <Text>All users</Text>
      {users &&
        users.filter(u => !(user.friends.includes(u.id) || user.blockedList.includes(u.id))).map(user => (
          <View key={user.id}>
            <Text style={styles.text}>* {user.displayName}</Text>
            <Button title="Add Friend" onPress={() => addFriend(user.id)} />
            <Button title="Block" onPress={() => addToBlockedList(user.id)} />
          </View>
        ))}
      <Text>Friends</Text>
      {users &&
        users.filter(u => user.friends.includes(u.id)).map(user => (
          <View key={user.id}>
            <Text style={styles.text}>* {user.displayName}</Text>
            <Button title="Remove" onPress={() => removeFriend(user.id)} />
          </View>
        ))}
      <Text>blockedList</Text>
      {users &&
        users.filter(u => user.blockedList.includes(u.id)).map(user => (
          <View key={user.id}>
            <Text style={styles.text}>* {user.displayName}</Text>
            <Button title="Remove" onPress={() => removeFromBlockedList(user.id)} />
          </View>
        ))}
    </ScrollView>
  );
}

LinksScreen.navigationOptions = {
  title: 'All users',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  }, text: {
    marginRight: "10%"
  }
});
