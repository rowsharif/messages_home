import * as WebBrowser from "expo-web-browser";
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
  View,
  Picker
} from "react-native";
import { CheckBox } from "react-native-elements";

import { MonoText } from "../components/StyledText";
import firebase from "firebase/app";
import "firebase/auth";
import db from "../db.js";

import Message from "./Message.js";

export default function HomeScreen() {
  const [location, setLocation] = useState({
    coords: {
      latitude: 25.340009,
      longitude: 51.430205
    }
  });
  const askPermission = async () => {
    const { status } = await Permissions.askAsync(Permissions.LOCATION);
    setHasLocationPermission(status === "granted");
  };

  const getLocation = async () => {
    const location = await Location.getCurrentPositionAsync({});
    setLocation(location);
    const snap = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();
    console.log("ge------------t", snap);
    const displayName = snap.data().displayName ? snap.data().displayName : " ";
    const photoURL = snap.data().photoURL ? snap.data().photoURL : " ";
    const friends  = snap.data().friends ? snap.data().friends : " ";
    const blockedList = snap.data().blockedList ? snap.data().blockedList : " ";
    const publicUser = snap.data().publicUser ? snap.data().publicUser : " ";
    const online = snap.data().online ? snap.data().online : " ";

    console.log(" Current location: ", location);
    await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .set({
        displayName,
        photoURL,
        location,
        friends,
        blockedList,
        publicUser,
        online
      });
  };

  useEffect(() => {
    askPermission();
    getLocation();
  }, [location]);
  const [messages, setMessages] = useState([]);
  const [to, setTo] = useState("Select user");
  const [text, setText] = useState("");
  const [id, setId] = useState("");
  const [timestamp, setTimestamp] = useState(null);
  const [users, setUsers] = useState(null);
  const [toMe, setToMe] = useState(false);
  const [fromFriends, setFromFriends] = useState(false);
  const [userMe, setUserMe] = useState(null);

  useEffect(() => {
    db.collection("messages").onSnapshot(querySnapshot => {
      const messages = [];
      querySnapshot.forEach(doc => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      console.log(" Current messages: ", messages);
      setMessages([...messages]);
      const snap2 = db
      .collection(`users`)
      .doc(firebase.auth().currentUser.uid)
      .onSnapshot(docSnapshot => {
        console.log("user snapshot data", docSnapshot.data());
        setUserMe(docSnapshot.data());
      });
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

  const handleSend = () => {
    const from = firebase.auth().currentUser.uid;
    const date = new Date().getDate(); //Current Date
    const month = new Date().getMonth() + 1; //Current Month
    const year = new Date().getFullYear(); //Current Year
    const hours = new Date().getHours(); //Current Hours
    const min = new Date().getMinutes(); //Current Minutes
    const sec = new Date().getSeconds(); //Current Seconds
    setTimestamp({ date, month, year, hours, min, sec });
    const t = { date, month, year, hours, min, sec };
    console.log("Time--------------", t);
    if (to != "Select user") {
      if (id) {
        if (from === firebase.auth().currentUser.uid) {
          db.collection("messages")
            .doc(id)
            .update({ from, to, text, timestamp: t });
        }
      } else {
        db.collection("messages").add({ from, to, text, timestamp: t });
      }
    }
    setTo("");
    setText("");
    setId("");
  };

  const handleEdit = message => {
    setTo(message.to);
    setText(message.text);
    setId(message.id);
  };

  const handleLogout = () => {
    firebase.auth().signOut();
  };

  return (
    <View style={styles.container}>
      <CheckBox title="To Me" checked={toMe} onPress={() => setToMe(!toMe)} />
      <CheckBox title="From Friends" checked={fromFriends} onPress={() => setFromFriends(!fromFriends)} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="always"
      >
        {messages.map((message, i) =>
          toMe ? (
            message.to === firebase.auth().currentUser.uid && (
              <Message key={i} message={message} handleEdit={handleEdit} />
            )
          ) :fromFriends? (
            userMe.friends.include(x=>message.from) &&
            <Message key={i} message={message} handleEdit={handleEdit} />
          ): (
            <Message key={i} message={message} handleEdit={handleEdit} />
          )
        )}
      </ScrollView>

      <Picker
        selectedValue={to}
        onValueChange={setTo}
        style={{ width: 160 }}
        mode="dropdown"
      >
        <Picker.Item label="Select user" value="Select user" />
        {users &&
          users.map(user => (
            <Picker.Item
              key={user.id}
              label={user.displayName}
              value={user.id}
            />
          ))}
      </Picker>

      <TextInput
        style={{ height: 40, borderColor: "gray", borderWidth: 1 }}
        onChangeText={setText}
        placeholder="Text"
        value={text}
      />
      <Button title="Send" onPress={handleSend} />
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

HomeScreen.navigationOptions = {
  header: null
};

function DevelopmentModeNotice() {
  if (__DEV__) {
    const learnMoreButton = (
      <Text onPress={handleLearnMorePress} style={styles.helpLinkText}>
        Learn more
      </Text>
    );

    return (
      <Text style={styles.developmentModeText}>
        Development mode is enabled: your app will be slower but you can use
        useful development tools. {learnMoreButton}
      </Text>
    );
  } else {
    return (
      <Text style={styles.developmentModeText}>
        You are not in development mode: your app will run at full speed.
      </Text>
    );
  }
}

function handleLearnMorePress() {
  WebBrowser.openBrowserAsync(
    "https://docs.expo.io/versions/latest/workflow/development-mode/"
  );
}

function handleHelpPress() {
  WebBrowser.openBrowserAsync(
    "https://docs.expo.io/versions/latest/workflow/up-and-running/#cant-see-your-changes"
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 30
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
