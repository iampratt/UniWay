import {
  Text,
  StyleSheet,
  View,
  Pressable,
  Image,
  Linking,
  ScrollView,
  Switch,
} from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';

const driver = require('../../assets/driver.png');

export default studMain = () => {
  const insets = useSafeAreaInsets();
  const blank = ' ';
  const [isEnabled, setIsEnabled] = useState(false);
  const [location, setLocation] = useState({
    latitude: 10,
    longitude: 10,
  });

  const toggleSwitch = () => {
    setIsEnabled(!isEnabled);
  };

  return (
    <View
      style={{
        paddingTop: insets.top,
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: '#ffe977',
      }}
    >
      <View style={styles.upper}>
        <Pressable
          onPress={() => {
            router.back();
          }}
          style={styles.backBtn}
        >
          <AntDesign name='back' size={27} color='black' />
        </Pressable>
        <Text style={styles.uniway}>UniWay</Text>
        <AntDesign name='message1' size={32} color='black' />
      </View>
      <View style={styles.main}>
        <ScrollView>
          <View style={styles.topBarWrapper}>
            <View style={styles.topBar} />
          </View>
          <View style={styles.welcome}>
            <Text style={styles.hello}>Hello, </Text>
            <Text style={styles.name}>Ritushree Bohara</Text>
          </View>
          <Text style={styles.college}>Manipal University Jaipur</Text>
          <View style={styles.travelPref}>
            <Text style={styles.travelPrefText}>Are you travelling?</Text>
            <Switch
              style={styles.switch}
              value={isEnabled}
              onValueChange={toggleSwitch}
            ></Switch>
          </View>
          <View style={styles.map}>
            <Image
              source={require('../../assets/temp.png')}
              style={{ height: 348, width: 358, borderRadius: 10 }}
            />
          </View>
        </ScrollView>
      </View>
      <View style={{ backgroundColor: '#fff9db' }}>
        <View style={styles.footer}>
          <View>
            <View style={styles.driverNameWrapper}>
              <Text style={styles.driverName}>Rakesh Kumar {blank}</Text>
              <Text style={styles.driverMisc}>is your driver today</Text>
            </View>
            <View style={styles.driverInfo}>
              <Image source={driver} style={styles.driverLogo} />
              <View
                style={{
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                }}
              >
                <Text style={{ fontSize: 20, fontWeight: '600' }}>
                  RJ14 EL 6675
                </Text>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: 'bold',
                    opacity: 0.8,
                    marginTop: 4,
                  }}
                >
                  Tavera
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  Linking.openURL(`sms: 9336105078`);
                }}
              >
                <Entypo name='message' size={32} color='black' />
              </Pressable>
              <Pressable
                onPress={() => {
                  Linking.openURL(`tel: 9336105078`);
                }}
              >
                <FontAwesome name='phone' size={32} color='black' />
              </Pressable>
            </View>
          </View>
          <View>
            <View style={styles.lowerFooterWrapper} />
            <View style={styles.lowerFooter}>
              <Pressable
                onPress={() => {
                  router.push('studDash');
                }}
              >
                <FontAwesome name='user-circle-o' size={40} color='black' />
              </Pressable>
              <Ionicons name='settings' size={40} color='black' />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  upper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  backBtn: {
    height: 45,
    width: 45,
    backgroundColor: '#ffd600',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uniway: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  main: {
    flex: 1,
    marginTop: 8,
    backgroundColor: '#fff9db',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
  },
  topBarWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    borderWidth: 2,
    width: 100,
    marginTop: 10,
  },
  welcome: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 20,
    paddingHorizontal: 30,
  },
  hello: {
    fontSize: 17,
    fontWeight: '600',
    alignSelf: 'flex-end',
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: -3,
  },
  college: {
    paddingHorizontal: 30,
    marginTop: 10,
    fontSize: 15,
    fontWeight: 'bold',
    opacity: 0.5,
  },
  travelPref: {
    flexDirection: 'row',
    paddingHorizontal: 30,
    marginTop: 25,
    alignItems: 'center',
  },
  travelPrefText: {
    fontSize: 17,
    fontWeight: '500',
  },
  switch: {
    marginHorizontal: 8,
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  map: {
    height: 350,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 30,
    marginHorizontal: 15,
  },
  footer: {
    backgroundColor: 'white',
    height: 220,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowOffset: { height: -3 },
    shadowOpacity: 0.15,
  },
  driverName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  driverMisc: {
    fontSize: 15,
    paddingBottom: 1,
    fontWeight: '600',
  },
  driverNameWrapper: {
    flexDirection: 'row',
    padding: 15,
    paddingLeft: 20,
    alignItems: 'flex-end',
  },
  driverLogo: {
    marginTop: -5,
    height: 70,
    width: 70,
    shadowOffset: { height: 2, width: 2 },
    shadowOpacity: 0.3,
  },
  driverInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 17,
    marginTop: 5,
  },
  lowerFooterWrapper: {
    height: 0,
    borderWidth: 0.5,
    shadowOffset: { height: -3 },
    shadowOpacity: 0.5,
    marginTop: 10,
  },
  lowerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 40,
    marginTop: 10,
  },
});
