import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View, StyleSheet, Image, Pressable } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { router } from 'expo-router';

const bgImg = require('../../assets/bgStud.png');

export default index = () => {
  return (
    <View style={styles.containerMain}>
      <Image source={bgImg} style={styles.containerImg} />
      <SafeAreaView style={styles.container}>
        <View style={styles.backBtnWrapper}>
          <Pressable
            onPress={() => {
              router.back();
            }}
            style={styles.backBtn}
          >
            <AntDesign name='back' size={24} color='black' />
          </Pressable>
        </View>
        <Text style={styles.header}>UniWay</Text>
        <View style={styles.logsignWrapper}>
          <Pressable
            onPress={() => {
              router.push('login');
            }}
            style={styles.logsign}
          >
            <Text style={styles.welcome}>Welcome</Text>
            <Text style={styles.login}>Log In with your college email id</Text>
          </Pressable>
          <View style={styles.signupWrapper}>
            <Text style={styles.signup}>sign up</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  containerMain: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  containerImg: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'cover',
    opacity: 0.78,
    transform: [{ translateY: 0 }],
  },
  backBtnWrapper: {
    justifyContent: 'flex-start',
    width: '100%',
    flexDirection: 'row',
  },
  backBtn: {
    left: 17,
    top: 17,
    height: 45,
    width: 45,
    backgroundColor: '#ffd600',
    borderRadius: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 45,
    fontWeight: 'bold',
    letterSpacing: 1.3,
    marginBottom: 50,
    color: 'white',
    top: 100,
  },
  logsignWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 400,
    gap: 20,
  },
  logsign: {
    backgroundColor: '#ffe977',
    justifyContent: 'center',
    alignItems: 'center',
    height: 85,
    width: '80%',
    paddingVertical: 0,
    borderRadius: 25,
    shadowOffset: { height: 5, width: 5 },
    shadowOpacity: 0.35,
  },
  welcome: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: -5,
    shadowOffset: { height: 1, width: 1 },
    shadowOpacity: 0.15,
  },
  login: {
    fontWeight: '600',
  },
  signupWrapper: {
    backgroundColor: '#ffe977',
    justifyContent: 'center',
    alignItems: 'center',
    height: 35,
    width: '35%',
    borderRadius: 25,
    borderWidth: 0.2,
    borderColor: 'black',
  },
  signup: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});
