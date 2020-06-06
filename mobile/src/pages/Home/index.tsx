import React, { useState, useEffect } from 'react'
import { Feather as Icon } from '@expo/vector-icons'
import { StyleSheet, ImageBackground, View, Image, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { RectButton } from 'react-native-gesture-handler'
import { useNavigation } from '@react-navigation/native'
import RNPickerSelect from 'react-native-picker-select';


import ibge from '../../services/ibge';
interface IBGEUFResponse {
  sigla: string;
}

interface IBGECityResponse {
  nome: string;
}

interface FormatPickerSelect {
  label: string;
  value: string;
}

const Home = () => {

  const [ufs, setUfs] = useState<FormatPickerSelect[]>([]);
  const [cities, setCities] = useState<FormatPickerSelect[]>([]);

  const [selectedUf, setSelectedUf] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');
  const navigation = useNavigation();

  useEffect(() => {
    async function loadUfs() {
      const response = await ibge.get<IBGEUFResponse[]>('localidades/estados');

      const ufInitials = response.data.map(uf => {
        return {
          label: uf.sigla,
          value: uf.sigla,
        };
      });

      setUfs(ufInitials);
    }
    loadUfs();
  }, []);

  useEffect(() => {
    async function loadCities() {
      if (selectedUf === '0') return;

      const response = await ibge.get<IBGECityResponse[]>(`localidades/estados/${selectedUf}/municipios`);

      const cityNames = response.data.map(city => {
        return {
          label: city.nome,
          value: city.nome,
        };
      });

      setCities(cityNames);
    }
    loadCities();
  }, [selectedUf]);


  function handleNavigateToPoints() {
    if (selectedUf === '0' || selectedCity === '0')
      Alert.alert('Ooops...', 'Precisamos que selecione o Estado (UF) e a Cidade.');
    else
      navigation.navigate('Points', { uf: selectedUf, city: selectedCity });
  }


  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      <ImageBackground source={require('../../assets/home-background.png')} style={styles.container} imageStyle={{ width: 274, height: 368 }} >
        <View style={styles.main}>
          <Image source={require('../../assets/logo.png')} />
          <View>
            <Text style={styles.title}>Seu Marktplace de coleta de resíduos</Text>
            <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de forma eficiente.</Text>
          </View>
        </View>


        <View style={styles.footer}>

          {ufs.length > 0 && (
            <RNPickerSelect
              placeholder={{
                label: 'Selecione um Estado',
                value: '0',
              }}
              style={pickerSelectStyles}
              useNativeAndroidPickerStyle={false}
              onValueChange={(value) => {
                setSelectedUf(String(value));
                setSelectedCity('0');
              }}
              items={ufs}

            />
          )}

          {selectedUf !== '0' && (
            <RNPickerSelect
              placeholder={{
                label: 'Selecione uma Cidade',
                value: '0',
              }}
              style={pickerSelectStyles}
              useNativeAndroidPickerStyle={false}
              onValueChange={(value) => setSelectedCity(String(value))}
              items={cities}
            />
          )}


          <RectButton style={styles.button} onPress={handleNavigateToPoints}>
            <View style={styles.buttonIcon}>
              <Text>
                <Icon name="arrow-right" color="#FFF" size={24}></Icon>
              </Text>
            </View>
            <Text style={styles.buttonText}>
              Entrar
          </Text>
          </RectButton>

        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  )
}

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    paddingVertical: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16, // to ensure the text is never behind the icon
  },
  inputAndroid: {

    paddingVertical: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,

  },

  main: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    color: '#322153',
    fontSize: 32,
    fontFamily: 'Ubuntu_700Bold',
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {},

  select: {},

  input: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
  },

  button: {
    backgroundColor: '#34CB79',
    height: 60,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonText: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  }
});

export default Home