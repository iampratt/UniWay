import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View, Pressable, Image } from 'react-native';

const bgImg = require('../assets/optionBG.png');

export default index = () => {
  return (
    <View style={styles.container}>
      <Image source={bgImg} style={styles.containerImg} />
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>UniWay</Text>
        <Pressable
          style={styles.wrapper}
          onPress={() => {
            router.push('(student)');
          }}
        >
          <Text style={styles.body}>student</Text>
        </Pressable>
        <Pressable
          style={styles.wrapper}
          onPress={() => {
            router.push('(driver)');
          }}
        >
          <Text style={styles.body}>driver</Text>
        </Pressable>
        <Pressable
          style={styles.wrapper}
          onPress={() => {
            router.push('(owner)');
          }}
        >
          <Text style={styles.body}>owner</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  containerImg: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'cover',
    opacity: 0.78,
    transform: [{ translateY: 20 }],
  },
  header: {
    fontSize: 50,
    fontWeight: 'bold',
    marginBottom: 50,
  },
  wrapper: {
    width: 270,
    height: 50,
    marginVertical: 10,
    shadowOffset: { height: 2, width: 2 },
    shadowOpacity: 0.4,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffd601',
  },
  body: {
    fontSize: 20,
    fontWeight: 'bold',
    shadowOffset: { height: 1, width: 2 },
    shadowOpacity: 0.1,
  },
});
