import React, { useState, useEffect } from "react";
import { StyleSheet, View, Image, Text, TextInput, Button } from "react-native";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/storage";
import db from "../db";
import * as ImagePicker from "expo-image-picker";

export default function SettingsScreen() {
  const [hasCameraRollPermission, setHasCameraRollPermission] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [uri, setUri] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [location, setLocation] = useState("");
  const [friends, setFriends] = useState(null);
  const [blockedList, setBlockedList] = useState(null);
  const [publicUser, setpublicUser] = useState(null);
  const [online, setOnline] = useState(null);

  const askPermission = async () => {
    const { status } = await ImagePicker.requestCameraRollPermissionsAsync();
    setHasCameraRollPermission(status === "granted");
  };

  useEffect(() => {
    askPermission();
  }, []);

  const handleSet = async () => {
    const snap = await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get();
    snap.data().displayName && setDisplayName(snap.data().displayName);
    snap.data().photoURL && setPhotoURL(snap.data().photoURL);
    snap.data().location && setLocation(snap.data().location);
    snap.data().friends && setFriends(snap.data().friends);
    snap.data().blockedList && setBlockedList(snap.data().blockedList);
    snap.data().publicUser && setpublicUser(snap.data().publicUser);
    snap.data().online && setOnline(snap.data().online);
  };

  useEffect(() => {
    // setDisplayName(firebase.auth().currentUser.displayName);
    // setPhotoURL(firebase.auth().currentUser.photoURL);
    handleSet();
  }, []);

  const handleSave = async () => {
    // - use firebase storage
    if (uri !== "") {
      const response = await fetch(uri);
      console.log("fetch result", JSON.stringify(response));

      const blob = await response.blob();
      //console.log("blob result", JSON.stringify(blob));

      // - upload selected image to default bucket, naming with uid
      const putResult = await firebase
        .storage()
        .ref()
        .child(firebase.auth().currentUser.uid)
        .put(blob);
      //console.log("put result", JSON.stringify(putResult));
      // - get url and set photoURL

      const url = await firebase
        .storage()
        .ref()
        .child(firebase.auth().currentUser.uid)
        .getDownloadURL();
      console.log("download url", url);

      setPhotoURL(url);
    }

    db.collection("users")
      .doc(firebase.auth().currentUser.uid)
      .set({ displayName, photoURL, location, friends, blockedList, publicUser, online });
  };

  const handlePickImage = async () => {
    // show camera roll, allow user to select
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1
    });

    if (!result.cancelled) {
      console.log("not cancelled", result.uri);
      setUri(result.uri);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={{
          height: 40,
          borderColor: "gray",
          borderWidth: 1,
          fontSize: 24
        }}
        onChangeText={setDisplayName}
        placeholder="Display Name"
        value={displayName}
      />
      {photoURL !== "" && (
        <Image style={{ width: 100, height: 100 }} source={{ uri: photoURL }} />
      )}
      <Button title="Pick Image" onPress={handlePickImage} />
      <Button title="Save" onPress={handleSave} />
    </View>
  );
}

SettingsScreen.navigationOptions = {
  title: "Settings"
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
