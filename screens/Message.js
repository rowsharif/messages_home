import React, { useState, useEffect } from "react";
import {
  Image,
  Platform,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { MonoText } from "../components/StyledText";
import firebase from "firebase/app";
import "firebase/auth";

import db from "../db.js";

export default ({ message, handleEdit }) => {
  const [user, setUser] = useState(null);
  const [userTo, setUserTo] = useState(null);
  const [userMe, setUserMe] = useState(null);

  const handleUser = () => {
    const snap = db
      .collection(`users`)
      .doc(message.from)
      .onSnapshot(docSnapshot => {
        console.log("user snapshot data", docSnapshot.data());
        setUser(docSnapshot.data());
      });
    const snap1 = db
      .collection(`users`)
      .doc(message.to)
      .onSnapshot(docSnapshot => {
        console.log("user snapshot data", docSnapshot.data());
        setUserTo(docSnapshot.data());
      });
      const snap2 = db
      .collection(`users`)
      .doc(firebase.auth().currentUser.uid)
      .onSnapshot(docSnapshot => {
        console.log("user snapshot data", docSnapshot.data());
        setUserMe(docSnapshot.data());
      });
  };

  useEffect(() => {
    handleUser();
    console.log("id--------id", message.to, firebase.auth().currentUser.uid);
  }, []);

  const handleDelete = message => {
    db.collection("messages")
      .doc(message.id)
      .delete();
  };

  return (
    user &&
    userTo && (
      <View
        style={{
          paddingTop: 50,
          flexDirection: "row",
          backgroundColor:
            message.to == firebase.auth().currentUser.uid ? "#acf2d4" 
            : userMe.friends.include(x=>message.from) ? "#eee" 
            : null
        }}
      >
        <Image
          style={{ width: 50, height: 50 }}
          source={{ uri: user.photoURL }}
        />
        <Text style={styles.getStartedText}>
          {user.displayName} - {userTo.displayName} - {message.text}{" "}
        </Text>
        <View>
          <Text>
            {message.timestamp.date}/{message.timestamp.month}/
            {message.timestamp.year} -{message.timestamp.hours}:
            {message.timestamp.min}:{message.timestamp.sec}
          </Text>
        </View>

        {firebase.auth().currentUser.uid === message.from && (
          <View>
            <Button title="Edit" onPress={() => handleEdit(message)} />
            <Button title="X" onPress={() => handleDelete(message)} />
          </View>
        )}
      </View>
    )
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  developmentModeText: {
    marginBottom: 20,
    color: "rgba(0,0,0,0.4)",
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center"
  },
  contentContainer: {
    paddingTop: 30
  },
  welcomeContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: "contain",
    marginTop: 3,
    marginLeft: -10
  },
  getStartedContainer: {
    alignItems: "center",
    marginHorizontal: 50
  },
  homeScreenFilename: {
    marginVertical: 7
  },
  codeHighlightText: {
    color: "rgba(96,100,109, 0.8)"
  },
  codeHighlightContainer: {
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 3,
    paddingHorizontal: 4
  },
  getStartedText: {
    fontSize: 24,
    color: "rgba(96,100,109, 1)",
    lineHeight: 24,
    textAlign: "center"
  },
  tabBarInfoContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: "black",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3
      },
      android: {
        elevation: 20
      }
    }),
    alignItems: "center",
    backgroundColor: "#fbfbfb",
    paddingVertical: 20
  },
  tabBarInfoText: {
    fontSize: 17,
    color: "rgba(96,100,109, 1)",
    textAlign: "center"
  },
  navigationFilename: {
    marginTop: 5
  },
  helpContainer: {
    marginTop: 15,
    alignItems: "center"
  },
  helpLink: {
    paddingVertical: 15
  },
  helpLinkText: {
    fontSize: 14,
    color: "#2e78b7"
  }
});
