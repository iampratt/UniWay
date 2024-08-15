import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
const logo = require('../../assets/logo.png');

export default LogIn = () => {
  const [email, setEmail] = useState('');
  const [passw, setPassw] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>UniWay</Text>
      <Image source={logo} style={styles.logo} />
      <KeyboardAvoidingView behavior='position' keyboardVerticalOffset={50}>
        {/* <ScrollView> */}
        <TextInput
          style={styles.input}
          placeholder='driver id'
          keyboardType='email-address'
          onChangeText={setEmail}
          value={email}
          clearButtonMode='always'
        />
        {/* <View style={{ height: 17 }}></View> */}
        <TextInput
          style={styles.input}
          placeholder='password'
          onChangeText={setPassw}
          value={passw}
          clearButtonMode='always'
          secureTextEntry
        />
      </KeyboardAvoidingView>
      <Pressable
        onPress={() => {
          router.push('driverMain');
        }}
      >
        <View style={styles.button}>
          <Text style={styles.buttonText}>log in</Text>
        </View>
      </Pressable>
      <Pressable
        onPress={() => {
          router.push('signup');
        }}
      >
        <Text style={styles.signup}>not registered with us?</Text>
      </Pressable>
      <Pressable
        onPress={() => {
          alert('Redirect to forget pass');
        }}
      >
        <Text style={styles.footer}>forgot password?</Text>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#ebe7c7',
  },
  header: {
    paddingTop: 20,
    fontSize: 35,
    alignSelf: 'center',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  logo: {
    height: 325,
    width: 325,
    marginTop: 45,
    marginBottom: 45,
    alignSelf: 'center',
  },
  input: {
    backgroundColor: '#f5f5f5',
    height: 40,
    borderRadius: 30,
    marginHorizontal: 26,
    marginVertical: 8,
    paddingHorizontal: 12,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
  },
  button: {
    justifyContent: 'center',
    height: 40,
    marginTop: 17,
    marginBottom: 17,
    width: 100,
    // backgroundColor: '#fee900',
    backgroundColor: '#00c8ff',
    borderRadius: 50,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    alignSelf: 'center',
    fontSize: 18,
    fontWeight: '500',
  },
  signup: {
    marginBottom: 80,
    opacity: 0.5,
    alignSelf: 'center',
    fontWeight: 'bold',
  },
  footer: {
    opacity: 0.5,
    alignSelf: 'center',
    fontWeight: 'bold',
    alignSelf: 'center',
  },
});
