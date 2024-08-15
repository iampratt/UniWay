import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import AntDesign from '@expo/vector-icons/AntDesign';
import { router } from 'expo-router';
import { useState } from 'react';
import { useHeaderHeight } from '@react-navigation/elements';

export default studMain = () => {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const [email, setEmail] = useState('ritushree@muj.manipal.edu');
  const [phone, setPhone] = useState('+91 123456789');
  const [address, setAddress] = useState('Jaipur, Rajasthan');
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [contactEmergency, setContactEmergency] = useState('');

  const EmergencyContact = (props) => {
    return (
      <View
        style={{
          flex: 1,
          gap: 3,
          paddingVertical: 10,
          paddingHorizontal: 15,
          borderWidth: 1.8,
          borderRadius: 10,
          shadowOffset: { height: 1, width: 1 },
          shadowOpacity: 0.2,
          backgroundColor: '#ffd600',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Text style={{ fontWeight: '600', fontSize: 14 }}>{props.name}</Text>
          <Text style={{ fontWeight: '600', fontSize: 14 }}>
            {props.contact}
          </Text>
        </View>
        <Text style={{}}>{props.role}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/clouds.png')}
        style={{ position: 'absolute', top: 0 }}
      />
      <View
        style={{
          paddingTop: insets.top,
          flex: 1,
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <View style={styles.upper}>
          <Pressable
            onPress={() => {
              router.push('studMain');
            }}
          >
            <MaterialCommunityIcons
              name='home-circle'
              size={44}
              color='black'
            />
          </Pressable>
        </View>
        <View style={styles.main}>
          <View style={styles.profilePhotoWrapper}>
            <Image source={require('../../assets/profile.png')} />
          </View>
          <Text style={styles.profileName}>Ritushree Bohara</Text>
          <View style={styles.studInfo}>
            <Text style={styles.studInfoText}>Student</Text>
            <Entypo name='dot-single' size={24} color='black' />
            <Text style={styles.studInfoText}>Manipal University, Jaipur</Text>
          </View>
          <ScrollView style={styles.scrollViewWrapper}>
            <View style={styles.mainContentWrapper}>
              <View style={styles.mainContent1}>
                <View style={styles.mainContent1Data}>
                  <MaterialCommunityIcons
                    name='account-voice'
                    size={24}
                    color='black'
                  />
                  <Text style={styles.mainContent1DataText}>English</Text>
                  <Text>Language</Text>
                </View>
                <View style={{ height: '70%', borderLeftWidth: 1.2 }} />
                <View style={styles.mainContent1Data}>
                  <Entypo name='location' size={24} color='black' />
                  <Text style={styles.mainContent1DataText}>Jaipur</Text>
                  <Text>Location</Text>
                </View>
                <View style={{ height: '70%', borderLeftWidth: 1.2 }} />
                <View style={styles.mainContent1Data}>
                  <FontAwesome5 name='car' size={24} color='black' />
                  <Text style={styles.mainContent1DataText}>02</Text>
                  <Text>Rides</Text>
                </View>
              </View>
              <View style={styles.mainContent2}>
                <Text style={styles.mainContent2Header}>Personal Details</Text>
                <View style={styles.mainContent2LineWrapper}>
                  <KeyboardAvoidingView
                    keyboardVerticalOffset={headerHeight + 247}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                      <View style={styles.mainContent2Line}>
                        <Text style={styles.inputQues}>College Mail ID:</Text>
                        <TextInput
                          style={styles.input}
                          keyboardType='email-address'
                          onChangeText={setEmail}
                          value={email}
                        />
                        <View style={{ flex: 1 }} />
                      </View>
                    </TouchableWithoutFeedback>
                  </KeyboardAvoidingView>
                  <KeyboardAvoidingView
                    keyboardVerticalOffset={headerHeight + 247}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                      <View style={styles.mainContent2Line}>
                        <Text style={styles.inputQues}>Phone Number:</Text>
                        <TextInput
                          style={styles.input}
                          keyboardType='phone-pad'
                          onChangeText={setPhone}
                          value={phone}
                        />
                        <View style={{ flex: 1 }} />
                      </View>
                    </TouchableWithoutFeedback>
                  </KeyboardAvoidingView>
                  <KeyboardAvoidingView
                    keyboardVerticalOffset={headerHeight + 247}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                      <View style={styles.mainContent2Line}>
                        <Text style={styles.inputQues}>Address:</Text>
                        <TextInput
                          style={styles.input}
                          onChangeText={setAddress}
                          value={address}
                        />
                        <View style={{ flex: 1 }} />
                      </View>
                    </TouchableWithoutFeedback>
                  </KeyboardAvoidingView>
                </View>
              </View>
              <KeyboardAvoidingView style={styles.mainContent3Wrapper}>
                <View style={styles.mainContent3}>
                  <Text style={styles.mainContent3Header}>
                    Emergency Contacts
                  </Text>
                  <View style={styles.emergencyContactWrapper}>
                    <EmergencyContact
                      name='Ishan Jain'
                      role='Father'
                      contact='+91 9998887776'
                    />
                  </View>
                  <View style={styles.mainContent2LineWrapper}>
                    <KeyboardAvoidingView
                      keyboardVerticalOffset={headerHeight + 247}
                      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    >
                      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.mainContent2Line}>
                          <Text style={styles.inputQues}>Name: </Text>
                          <TextInput
                            style={styles.input}
                            onChangeText={setName}
                            value={name}
                          />
                        </View>
                      </TouchableWithoutFeedback>
                    </KeyboardAvoidingView>
                    <KeyboardAvoidingView
                      keyboardVerticalOffset={headerHeight + 247}
                      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    >
                      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.mainContent2Line}>
                          <Text style={styles.inputQues}>Relation</Text>
                          <TextInput
                            style={styles.input}
                            onChangeText={setRelation}
                            value={relation}
                          />
                          <View style={{ flex: 1 }} />
                        </View>
                      </TouchableWithoutFeedback>
                    </KeyboardAvoidingView>
                    <KeyboardAvoidingView
                      keyboardVerticalOffset={headerHeight + 247}
                      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    >
                      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.mainContent2Line}>
                          <Text style={styles.inputQues}>Phone Number:</Text>
                          <TextInput
                            style={styles.input}
                            keyboardType='phone-pad'
                            onChangeText={setContactEmergency}
                            value={contactEmergency}
                          />
                          <View style={{ flex: 1 }} />
                        </View>
                      </TouchableWithoutFeedback>
                    </KeyboardAvoidingView>
                  </View>
                  <Pressable style={styles.addNewWrapper}>
                    <View style={styles.addNew}>
                      <Text style={styles.addNewText}>Add New</Text>
                    </View>
                  </Pressable>
                </View>
              </KeyboardAvoidingView>
              <View style={styles.complaintBox}>
                <AntDesign name='customerservice' size={24} color='black' />
                <Text style={{ fontSize: 16, fontWeight: '500' }}>
                  Raise a complaint
                </Text>
              </View>
              <View style={{ height: 20 }} />
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  upper: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 5,
    width: '100%',
  },
  main: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 90,
    backgroundColor: '#fff9db',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    width: '100%',
  },
  profilePhotoWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -100,
  },
  profileName: {
    fontSize: 20,
    marginTop: -7,
    fontWeight: 'bold',
  },
  studInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  studInfoText: {
    fontSize: 15,
    fontWeight: '400',
  },
  scrollViewWrapper: {
    flex: 1,
    width: '100%',
    marginTop: 20,
  },
  mainContentWrapper: {
    flex: 1,
    gap: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  mainContent1: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ffe977',
    width: '85%',
    paddingVertical: 15,
    borderRadius: 10,
  },
  mainContent1Data: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    width: '33.33%',
  },
  mainContent1DataText: { fontWeight: 'bold' },
  mainContent2: {
    backgroundColor: '#ffe977',
    width: '85%',
    flex: 1,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 15,
    gap: 5,
  },
  mainContent2Header: { fontWeight: 'bold', marginBottom: 3 },
  mainContent2LineWrapper: {
    flex: 1,
    width: '100%',
    gap: 4,
  },
  mainContent2Line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputQues: {
    flex: 1,
    minWidth: '35%',
    fontWeight: '500',
    marginRight: 3,
  },
  input: {
    backgroundColor: 'white',
    height: 20,
    borderRadius: 5,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 1,
    width: '65%',
    shadowOffset: { height: 1, width: 1 },
    shadowOpacity: 0.27,
  },
  mainContent3Wrapper: {
    backgroundColor: '#ffe977',
    width: '85%',
    flex: 1,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  mainContent3: {
    gap: 5,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  mainContent3Header: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emergencyContactWrapper: {
    flex: 1,
    marginBottom: 10,
  },
  addNewWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 7,
  },
  addNew: {
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 5,
    borderWidth: 1.5,
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
  },
});
