import { Text, StyleSheet, View, Pressable } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';

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
        <View style={styles.topBarWrapper}>
          <View style={styles.topBar} />
        </View>
        <View style={styles.welcome}>
          <Text style={styles.hello}>Hello, </Text>
          <Text style={styles.name}>Ramesh Kumar</Text>
        </View>
        <Text style={styles.college}>Manipal University Jaipur</Text>
        <View style={styles.driverInfoWrapper}>
          <View style={styles.driverInfo}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', opacity: 0.6 }}>
              Driver ID:
            </Text>
            <Text style={{ fontSize: 16 }}>1234</Text>
          </View>
          <View style={styles.driverInfo}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', opacity: 0.6 }}>
              Manager Phone No:
            </Text>
            <Text style={{ fontSize: 16 }}>+91 123456789</Text>
          </View>
        </View>
        <View style={styles.events}>
          <View style={styles.eventsHead}>
            <Text style={styles.eventsHeadText}>Upcoming Events </Text>
          </View>
          <View style={styles.eventsBody}>
            <Pressable
              style={styles.eventsList}
              onPress={() => {
                alert('Backend not live!');
              }}
            >
              <View style={styles.eventIconWrapper}>
                <FontAwesome name='map-marker' size={30} color='black' />
              </View>
              <View style={styles.eventsListBody}>
                <Text style={styles.eventsListBodyHeadText}>
                  Morning Pickup
                </Text>
                <Text style={styles.eventsListBodyText}>
                  Tue, Apr 9, 06:00hrs
                </Text>
              </View>
            </Pressable>
            <Pressable
              style={styles.eventsList}
              onPress={() => {
                alert('Backend not live!');
              }}
            >
              <View style={styles.eventIconWrapper}>
                <FontAwesome name='map-marker' size={30} color='black' />
              </View>
              <View style={styles.eventsListBody}>
                <Text style={styles.eventsListBodyHeadText}>
                  Afternoon Drop Off
                </Text>
                <Text style={styles.eventsListBodyText}>
                  Mon, Apr 8, 15:00hrs
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
        <View style={styles.complaintBox}>
          <AntDesign name='customerservice' size={24} color='black' />
          <Text style={{ fontSize: 16, fontWeight: '500' }}>
            Raise a complaint
          </Text>
        </View>
      </View>
      <View style={{ backgroundColor: '#fff9db' }}>
        <View style={styles.footer}>
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
    paddingHorizontal: 30,
    justifyContent: 'flex-start',
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
    marginTop: 10,
    fontSize: 15,
    fontWeight: 'bold',
    opacity: 0.5,
  },
  driverInfoWrapper: { marginTop: 18, gap: 3 },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  events: {
    marginTop: 30,
    borderRadius: 17,
  },
  eventsHead: {
    backgroundColor: '#fdde3b',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopLeftRadius: 17,
    borderTopRightRadius: 17,
    height: 50,
    justifyContent: 'center',
  },
  eventsHeadText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  eventsBody: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#ffed85',
    borderBottomLeftRadius: 17,
    borderBottomRightRadius: 17,
  },
  eventsList: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    paddingHorizontal: 10,
  },
  eventIcon: {
    height: 50,
    width: 50,
  },
  eventIconWrapper: {
    backgroundColor: '#f5f5f5',
    shadowOffset: { height: 2.5, width: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 2,
    borderRadius: 10,
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventsListBody: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    height: 60,
  },
  eventsListBodyHeadText: {
    fontSize: 16,
    fontWeight: '600',
  },
  eventsListBodyText: {
    fontSize: 14,
    fontWeight: 'bold',
    opacity: 0.45,
    paddingTop: 2.7,
  },
  complaintBox: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
    borderRadius: 40,
    borderWidth: 2,
    width: '85%',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 25,
    width: '100%',
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
