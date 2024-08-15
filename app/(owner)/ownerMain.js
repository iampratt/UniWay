import {
  Text,
  StyleSheet,
  View,
  Pressable,
  Image,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';

const wave = require('../../assets/ownerWaving.png');
const opt1 = require('../../assets/opt1.png');
const opt2 = require('../../assets/opt2.png');
const opt3 = require('../../assets/opt3.png');
const opt4 = require('../../assets/opt4.png');

export default studMain = () => {
  const insets = useSafeAreaInsets();
  const blank = ' ';
  const manageData = [
    {
      date: 17,
      day: 'Today',
      me: 'Morning Pickup Schedule',
      driver: 'Joey Tribbiani',
      time: '6:00 am',
    },
    {
      date: 17,
      day: 'Today',
      me: 'Evening Drop Schedule',
      driver: 'Chandler Bing',
      time: '4:00 pm',
    },
    {
      date: 18,
      day: 'Tomorrow',
      me: 'Morning Pickup Schedule',
      driver: 'Ross Geller',
      time: '6:00 am',
    },
    {
      date: 18,
      day: 'Tomorrow',
      me: 'Evening Drop Schedule',
      driver: 'Gunther',
      time: '4:00 pm',
    },
  ];

  const Manage = ({ props }) => {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <View
          style={{
            borderWidth: 1,
            borderRadius: 10,
            padding: 10,
            width: '28%',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#ffe977',
            gap: 4,
          }}
        >
          <Text style={{ fontWeight: '600' }}>{props.date}</Text>
          <Text style={{ fontWeight: '600' }}>{props.day}</Text>
        </View>
        <View style={{ gap: 3 }}>
          <Text style={{ opacity: 0.6, fontWeight: '600' }}>{props.me}</Text>
          <View
            style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 5 }}
          >
            <Text style={{ fontWeight: '600' }}>Driver:</Text>
            <Text style={{ fontSize: 18 }}>{props.driver}</Text>
          </View>
          <View
            style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 5 }}
          >
            <Text style={{ fontWeight: '600' }}>Scheduled Time:</Text>
            <Text style={{ fontSize: 18 }}>{props.time}</Text>
          </View>
        </View>
        <View
          style={{
            borderRadius: 6,
            borderWidth: 1.3,
            padding: 3,
            backgroundColor: '#ffe977',
          }}
        >
          <Text>Route</Text>
        </View>
      </View>
    );
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
        <View style={styles.topBarWrapper}>
          <View style={styles.topBar} />
        </View>
        <View style={styles.welcomeWrapper}>
          <View style={styles.welcome}>
            <Text style={styles.hello}>Welcome, </Text>
            <Text style={styles.name}>Vikas Kumar</Text>
            <Text style={styles.college}>Manipal University Jaipur</Text>
          </View>
          <Image source={wave} />
        </View>
        <View style={styles.optionWrapper}>
          <View style={styles.option}>
            <Image source={opt1} style={styles.optionImg} />
            <Text style={styles.optionText}>Students</Text>
          </View>
          <View style={styles.option}>
            <Image source={opt2} style={styles.optionImg} />
            <Text style={styles.optionText}>Vehicles</Text>
          </View>
          <View style={styles.option}>
            <Image source={opt3} style={styles.optionImg} />
            <Text style={styles.optionText}>Drivers</Text>
          </View>
          <View style={styles.option}>
            <Image source={opt4} style={styles.optionImg} />
            <Text style={styles.optionText}>Reports</Text>
          </View>
        </View>
        <View style={styles.manageWrapper}>
          <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 17 }}>
            Manage:
          </Text>
          <FlatList
            data={manageData}
            renderItem={({ item }) => <Manage props={item} />}
            ItemSeparatorComponent={() => (
              <View style={{ height: 1, borderWidth: 1, marginVertical: 17 }} />
            )}
            ListFooterComponent={() => <View style={{ height: 20 }} />}
          />
        </View>
      </View>
      <View style={{ backgroundColor: '#fff9db' }}>
        <View style={styles.footer}>
          <View style={styles.lowerFooter}>
            <Pressable
              onPress={() => {
                alert('Backend not live!');
              }}
            >
              <FontAwesome name='user-circle-o' size={40} color='black' />
            </Pressable>
            <Ionicons name='settings' size={40} color='black' />
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
  welcomeWrapper: {
    flexDirection: 'row',
    justifyContent: 'spcae-between',
    alignItems: 'flex-end',
    marginRight: 10,
  },
  welcome: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 25,
    gap: 3,
  },
  hello: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  college: {
    fontSize: 15,
    fontWeight: 'bold',
    opacity: 0.5,
  },
  optionWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    gap: 15,
    marginTop: 30,
    paddingHorizontal: 10,
  },
  option: {
    backgroundColor: '#ffe977',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.5,
  },
  optionImg: {
    resizeMode: 'contain',
    height: 60,
    width: 60,
    overflow: 'hidden',
  },
  optionText: {
    fontWeight: '600',
  },
  manageWrapper: {
    flex: 1,
    marginHorizontal: 15,
    marginTop: 20,
  },
  footer: {
    backgroundColor: 'white',
    height: 90,
    shadowOffset: { height: -3 },
    shadowOpacity: 0.15,
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
    marginTop: 20,
  },
});
