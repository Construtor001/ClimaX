import React, { LegacyRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer, useNavigation, DrawerActions } from '@react-navigation/native';
import { createDrawerNavigator, DrawerNavigationProp } from '@react-navigation/drawer';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { StyleSheet, Modal, View, Text, Button, Platform, TouchableOpacity, Image, FlatList, TouchableWithoutFeedback, Pressable, Animated, ImageSourcePropType, findNodeHandle, UIManager, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { Picker } from '@react-native-picker/picker';

SplashScreen.preventAutoHideAsync();

const { width, height } = Dimensions.get('window');

const CustomIcon = () => (
<Svg
    width={width*0.03}
    height={height*0.022}
    viewBox="0 0 28.008 45.66"
    fill="none"
  >
    <Path
      d="M0,0L19.875,22.008L39.66,0L19.883,22.006Z"
      transform="translate(3 42.66) rotate(-90)"
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="6"
    />
  </Svg>
);

// Definindo os tipos das rotas
type RootDrawerParamList = {
  Home: undefined;
  Home2: undefined;
};

// Tipando o parâmetro navigation
type HomeScreenProps = {
  navigation: DrawerNavigationProp<RootDrawerParamList, 'Home'>;
};

type HomeScreen2Props = {
  navigation: DrawerNavigationProp<RootDrawerParamList, 'Home2'>;
};

interface cidades{
  id: number,
    nome: string,
    microrregiao: {
      id: number,
      nome: string,
      mesorregiao: {
        id: number,
        nome: string,
        UF: {
          id: number,
          sigla: string,
          nome: string,
          regiao: {
            id: number,
            sigla: string,
            nome: string
          }
        }
    }
  }
}

interface Clima {
  city: {
      coord: {
          lat: number;
          lon: number;
      };
      country: string;
      id: number;
      name: string;
      population: number;
      sunrise: number;
      sunset: number;
      timezone: number;
  };
  cnt: number;
  cod: string;
  list: Array<{
      clouds: {
          all: number;
      };
      dt: number;
      dt_txt: string;
      main: {
          temp: number;
          feels_like: number;
          temp_min: number;
          temp_max: number;
          pressure: number;
          sea_level: number;
          grnd_level: number;
          humidity: number;
          temp_kf: number;
      };
      pop: number;
      rain?: {
          '3h': number;
      };
      sys: {
          pod: string;
      };
      visibility: number;
      weather: Array<{
          id: number;
          main: string;
          description: string;
          icon: string;
      }>;
      wind: {
          speed: number;
          deg: number;
          gust: number;
      };
  }>;
  message: number;
}

interface c {
  city: {
      coord: {
          lat: number;
          lon: number;
      };
      country: string;
      id: number;
      name: string;
      population: number;
      sunrise: number;
      sunset: number;
      timezone: number;
  };
  cnt: number;
  cod: string;
  list: Array<{
      clouds: {
          all: number;
      };
      dt: number;
      dt_txt: string;
      main: {
          temp: number;
          feels_like: number;
          temp_min: number;
          temp_max: number;
          pressure: number;
          sea_level: number;
          grnd_level: number;
          humidity: number;
          temp_kf: number;
      };
      pop: number;
      rain?: {
          '3h': number;
      };
      sys: {
          pod: string;
      };
      visibility: number;
      weather: Array<{
          id: number;
          main: string;
          description: string;
          icon: string;
      }>;
      wind: {
          speed: number;
          deg: number;
          gust: number;
      };
  }>;
  message: number;
}

function HomeScreen({ navigation }: HomeScreenProps) {



  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cidadeSelecianado, setCidadeSelecionado] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [estadoSel, setEstadoSel] = useState("BA");
  const [cidadeSel, setCidadeSel] = useState("Salvador");
  const [tempMin, setTempMin] = useState([""]);
  const [tempMax, setTempMax] = useState([""]);
  const [diasDosGraus, setDiasDosGraus] = useState([{"diasDosGraus": "", "id": 0}]);
  const [tempAtual, setTempAtual] = useState([""]);
  const [datasAtuais, setDatasAtuais] = useState([""]);
  const [nomeEstadoDoDia, setNomeEstadoDoDia] = useState("");
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>();
  const [erro, setErro] = useState("");



  const [isVisible, setIsVisible] = useState(false);

  const [caminhoEstadoClima, setCaminhoEstadoClima] = useState<ImageSourcePropType[]>([]);

  const [estadoDoDia, setEstadoDoDia] = useState<string[]>([]);

  useEffect(() => {
    setCaminhoEstadoClima([])
    estadoDoDia.map((e)=>{
      if(e === "Thunderstorm with rain" || e === "Thunderstorm with light rain" || e === "Thunderstorm with heavy rain"){
        setCaminhoEstadoClima(prevState => [...prevState, require(`../../assets/images/tempestadeComChuva.png`)]);
        setNomeEstadoDoDia("Chuva com Relâmpagos")
      } else if (e === "Thunderstorm") {
        setNomeEstadoDoDia("Céu nublado Com Relâmpagos")
        setCaminhoEstadoClima(prevState => [...prevState, require(`../../assets/images/tempestade.png`)]);
      } else if (e === "Light drizzle" || e === "Drizzle" || e === "Heavy drizzle") {
        setNomeEstadoDoDia("Chuva Fraca")
        setCaminhoEstadoClima(prevState => [...prevState, require(`../../assets/images/chuvisco.png`)]);
      } else if (e === "Clear Sky") {
        setNomeEstadoDoDia("Dia Ensolarado")
        setCaminhoEstadoClima(prevState => [...prevState, require(`../../assets/images/sol2.png`)]);
      } else if (e === "Light rain" || e === "Moderate rain" || e === "Heavy rain" || e === "Freezing rain" || e === "Light intensity shower rain" || e === "Shower rain" || e === "Heavy intensity shower rain" || e === "Ragged shower rain" || e === "Light snow" || e === "Snow" || e === "Heavy snow" || e === "Mix snow/rain" || e === "Sleet" || e === "Shower sleet" || e === "Light shower snow" || e === "Shower snow" || e === "Heavy shower snow") {
        setNomeEstadoDoDia("Chuva de Neve")
        setCaminhoEstadoClima(prevState => [...prevState, require(`../../assets/images/chuvaNeve.png`)]);
      } else if (e === "Few clouds" || e === "Scattered clouds" || e === "Broken clouds" || e === "Overcast clouds") {
        setNomeEstadoDoDia("Dia Nublado ou Chuvoso")
        setCaminhoEstadoClima(prevState => [...prevState, require(`../../assets/images/nuvens.png`)]);
      } else if (e === "Mist" || e === "Smoke" || e === "Haze" || e === "Sand/dust" || e === "Fog" || e === "Freezing fog") {
        setNomeEstadoDoDia("Névoa e Tempestade")
        setCaminhoEstadoClima(prevState => [...prevState, require(`../../assets/images/nevoa.png`)]);
      } else {
        setNomeEstadoDoDia("Possíveis Desastres")
        setCaminhoEstadoClima(prevState => [...prevState, require(`../../assets/images/extremo.png`)]);
      }
    })
  }, [estadoDoDia]);


  useEffect(() => {
    let dataCorrigida = datasAtuais.map((e: any) => {
      let [year, month, day] = e.split("-");
      return new Date(`${year}-${month}-${day}T00:00:00`);
    });

    let diasDaSemana = ["Domingo", "Segunda - Feira", "Terça - Feira", "Quarta - Feira", "Quinta - Feira", "Sexta - Feira", "Sábado"];
    let diaDaSemana = dataCorrigida.map((date: any, index) => {
      return {
          diasDosGraus: diasDaSemana[date.getDay()],
          id: index
      };
  });
    setDiasDosGraus(diaDaSemana);

  }, [datasAtuais]);

  useEffect(() => {
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .then((response) => response.json())
      .then((json) => {
        const sigla = json.map((item: estados) => item.sigla);
        setData(sigla);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  const estadoUnico2 = (estad: string)=>{
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estad}/municipios`)
      .then((response) => response.json())
      .then((json) => {
          const sigla = json.map((item: cidades) => item.nome);
          setCidadeSelecionado(sigla)
      })
      .catch((error) => {
          console.error(error);
          return [];
    });
  }

  const consultarClima = () => {
    setSelectedBarIndex(null)
    setTempMin([])
    setErro("")
    setModalVisible(false)
    const url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${cidadeSel}&country=BR&key=78b31171441a4e02ac36c28f62c8b9db`;
  
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        const forecasts = json.data;

        const situacaoClimaAtual = forecasts.map((item: any) => item.weather.description);
        const dataAtual = forecasts.map((item: any) => item.valid_date);
  
        // Construir arrays de valores
        const minTemperatures = forecasts.map((item: any) => item.app_min_temp);
        const maxTemperatures = forecasts.map((item: any) => item.app_max_temp);
        const currentTemperatures = forecasts.map((item: any) => item.temp);
        
        
        setDatasAtuais(dataAtual);
        setEstadoDoDia(situacaoClimaAtual);

        // Atualizar o estado uma única vez
        setTempMin(minTemperatures);
        setTempMax(maxTemperatures);
        setTempAtual(currentTemperatures);

      })
      .catch((error) => {
        setErro("deu erro")
      });
  }

  
  const Conversor = ({data}: any) => {
    const [year, month, day] = data.split("-")
    const dataFormat = `${day} / ${month} / ${year}`
    return (
      <Text style={{color:"white", fontWeight:"bold", fontSize:(0.019*width)}}>Dia: {dataFormat}</Text>
    )
  }
  
  const handlePress = (index: any) => {
    // Alterna entre mostrar e ocultar
    setSelectedBarIndex(prevIndex => (prevIndex === index ? null : index));
  };

  const [visibilidade, setVisibilidade] = useState(false)
  const [valorIndex, setValorIndex] = useState()
  
  const referencia = useRef<TouchableWithoutFeedback>(null);
  const rootRef = useRef(null);
  const [layout, setLayout] = useState({ x: 0, y: 0 });
  const [tempo, setTempo] = useState(0);
  
  const TemperatureBar = ({ index, isSelected, onPress }: any) => {
    const referencia = useRef(null);
    const minTemp = Number(tempMin[index]);
    const maxTemp = Number(tempMax[index]);
    const currentTemp = Number(tempAtual[index]);

    let currentAtual = 0
    let cor = ""

    currentTemp > maxTemp ? currentAtual = maxTemp : currentAtual = currentTemp
    
    if (currentTemp > maxTemp){
      cor = "#F10F0F"
    }else if(currentTemp < minTemp){
      cor = "#100AC2"
    }else{
      cor = "#FFB509"
    }

    currentTemp < minTemp ? currentAtual = minTemp : currentAtual = currentTemp 

    const positionPercentage = Math.max(0, Math.min(100, ((currentAtual - minTemp) / (maxTemp - minTemp)) * 100));
    const positionInPixels = (positionPercentage / 100) * (width*0.17);
    const [value, setValue] = useState({ x: 0, y: 0, ind: 0});

    const [fadeOutTimeout, setFadeOutTimeout] = useState<NodeJS.Timeout | null>(null);
    const viewNodeHandle = findNodeHandle(referencia.current);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    
    //Medindo o componente
    if (viewNodeHandle) {
      requestAnimationFrame(() => {
        UIManager.measureInWindow(viewNodeHandle, (x, y, width, height) => {
        });
      });
    }
    
    useEffect(() => {
      if (isSelected) {
        setIsVisible(true)
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } 
      if(!isSelected) {
        setIsVisible(false)
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }
    }, [isSelected]);
  
    return (
      <TouchableWithoutFeedback onPress={onPress}>
        <View style={{position:"relative"}}>

          <Animated.View style={{opacity: fadeAnim, position:"absolute", backgroundColor:fadeAnim?"transparent":"", zIndex:2}}>
            <View style={{ justifyContent:"center", zIndex:2, alignItems:"center",height: (0.05*height), width: (0.26*width), backgroundColor: '#006BC8', borderRadius: 10, position:"absolute", left: -30, top: -9}}>
              <Conversor data={datasAtuais[index]} />
              <View style={{display:"flex", flexDirection:"row"}}>
                <Image style={{height:(0.05*width), width:(0.05*width), marginLeft:10, marginRight:-4}} source={caminhoEstadoClima[index]}/>
                <Text style={{color:"white", fontWeight:"bold", marginHorizontal:10, fontSize:(0.019*width), marginTop: (height*0.007)}}>{tempAtual[index]}° Graus</Text>
              </View>
            </View>
          </Animated.View>

          <View style={styles.arrumacaoBarra}>
            <View style={[styles.currentTempIndicator, { left: positionInPixels ? positionInPixels : 0, backgroundColor: cor,  }]}>
              <View style={{height:"100%", width:2, backgroundColor:"white"}}/>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };
  
  

  const [fontsLoaded] = useFonts({
    'segoe-ui': require('../../assets/fonts/segoe-ui.ttf'),
  });
  
  const onLayoutRootView = useCallback(async () => {
    consultarClima()
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }

  }, [fontsLoaded]);

  const closeModal = () => {
    setModalVisible(false);
    ("clicou1")
  };

  if (!fontsLoaded) {
    return null;
  }

  let dados = [
    {
      id: "01",
      diaSemana:"Seg",
      pos: "5",
      climaInicial: "21°",
      climaFinal: "25°"
    },
    {
      id: "02",
      diaSemana:"Ter",
      pos: "5",
      climaInicial: "23°",
      climaFinal: "25°"
    },
    {
      id: "03",
      diaSemana:"Qua",
      pos: "5",
      climaInicial: "26°",
      climaFinal: "28°"
    },
    {
      id: "04",
      diaSemana:"Qui",
      pos: "5",
      climaInicial: "19°",
      climaFinal: "23°"
    },
    {
      id: "05",
      diaSemana:"Sex",
      pos: "5",
      climaInicial: "28°",
      climaFinal: "32°"
    },
  ]

  const handleScreenPress = () => {
    setSelectedBarIndex(null)
    // Aqui você define isFadedIn como false e pode iniciar a animação de fade-out
    // setTimeout(()=>setValue({x:1000, y:1000, ind:0}), 500)
      // Animated.timing(fadeAnim, {
      //   toValue: 0,
      //   duration: 800,
      //   useNativeDriver: true,
      // }).start(() => setIsFadedIn(false)); // Atualiza o estado após a animação
  };

  return (
    <SafeAreaProvider onLayout={onLayoutRootView} initialMetrics={initialWindowMetrics}>
      <ExpoStatusBar translucent={true} style='light' backgroundColor="transparent" />
      <LinearGradient
        colors={["#100AC2", "#00D3E2"]}
        style={styles.container}
      >

        {/* <Animated.View style={{opacity: fadeAnim, position:"absolute", zIndex:2}}>
          <TouchableWithoutFeedback onPress={()=>{
            setTimeout(()=>setValue({x:1000, y:1000, ind:0}), 500)
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
            }).start(() => setIsFadedIn(false));
          }}>
            <View style={{ justifyContent:"center", alignItems:"center",height: 50, width: 120, backgroundColor: '#006BC8', borderRadius: 10, position:"absolute", left: (value.x-20), top: (value.y)}}>
              <Conversor data={datasAtuais[value.ind]} />
              <View style={{display:"flex", flexDirection:"row"}}>
                <Image style={{height:25, width:25, marginLeft:10, marginRight:-4}} source={caminhoEstadoClima[value.ind]}/>
                <Text style={{color:"white", fontWeight:"bold", marginHorizontal:10, fontSize:15,
                  marginTop:2
                }}>{tempAtual[value.ind]}° Graus</Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Animated.View> */}

        <TouchableWithoutFeedback onPress={handleScreenPress}>
          <View style={{ flex: 1, marginBottom:(0.01*height) }}>

            <View style={styles.content}>
              <Text style={styles.estiloTexto}>{diasDosGraus[0].diasDosGraus}</Text>
            </View>
                        
            <View style={styles.arrumarCidadeClima}>
              <View style={styles.cidadeClima}>

              <Modal
                  animationType="fade"
                  transparent={true}
                  visible={modalVisible}
                >
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, backgroundColor:"rgba(0,0,0,0.2)"}} pointerEvents="box-none">
                      <TouchableWithoutFeedback onPress={closeModal}>
                        <View style={{ flex: 1 }} />
                      </TouchableWithoutFeedback>
                    </View>

                    <View style={[styles.modalView, { zIndex: 2 }]}>
                      {/* Conteúdo interativo do modal */}
                      {loading ? (
                        <Text style={{ color: 'white' }}>Carregando...</Text>
                      ) : (
                        <View>
                          <View><Text style={{fontSize:(0.03*width), marginTop:5, marginLeft:10}}>Selecione seu Estado:</Text></View>
                          <View style={{height:1, backgroundColor:"rgba(0,0,0,0.4)", marginTop:10}}></View>
                          <Picker
                            selectedValue={estadoSel}
                            onValueChange={(itemValue, itemIndex) =>{
                                estadoUnico2(itemValue)
                                setEstadoSel(itemValue)
                              }
                            }
                            >
                              {data ? data.map((item, index)=>(
                                  <Picker.Item label={item} value={item} key={index} color='black' />    
                                )): null
                              }
                          </Picker>
                          <View style={{height:0.5, backgroundColor:"rgba(0,0,0,0.4)", marginBottom:20}}></View>
                          <View><Text style={{fontSize:(0.03*width), marginBottom:10, marginLeft:10}}>Selecione sua Cidade:</Text></View>
                          <View style={{height:0.5, backgroundColor:"rgba(0,0,0,0.4)"}}></View>
                          <Picker
                            style={{fontSize:(0.03*height)}}
                            selectedValue={cidadeSel}
                            onValueChange={(itemValue, itemIndex) =>{
                                setCidadeSel(itemValue)
                              }
                            }
                            >
                              {cidadeSelecianado ? cidadeSelecianado.map((item, index)=>(
                                  <Picker.Item label={item} value={item} key={index} color='black' />    
                                )): null
                              }
                          </Picker>
                          <View style={{height:1, backgroundColor:"rgba(0,0,0,0.4)"}}></View>
                          <TouchableWithoutFeedback onPress={()=>{consultarClima()}}>
                            <View style={{alignItems:"center"}}>
                              <View style={[{alignItems:"center", display:"flex", justifyContent:"center"}, styles.botaoBuscarClima ]}>
                                <Text style={{fontWeight:"bold", fontSize:(0.035*width), color:"white"}}>Consultar</Text>
                              </View>
                            </View>
                          </TouchableWithoutFeedback>
                        </View>

                      )}
                    </View>
                  </View>
                </Modal>
                <TouchableWithoutFeedback onPress={()=>{
                  setModalVisible(true)
                }}>
                    <View style={{display:"flex", flexDirection:"row", marginBottom:5}}>
                      <Text style={styles.estiloCidade}>{cidadeSel} - {estadoSel}</Text>
                      <View style={{marginTop:(height*0.008), marginLeft:10}}>
                        <CustomIcon />
                      </View>
                    </View>
                </TouchableWithoutFeedback>
              </View>
              {tempMin[1] ? (
                <View style={{alignItems:"center"}}>
                  <View style={styles.arrumarGraus}>
                    <Text style={styles.estiloGraus}>{Math.round(Number(tempAtual[0]))}°</Text>
                    <Image style={styles.imagemGraus} source={(caminhoEstadoClima[0])}/>
                  </View>
                  <View style={styles.arrumarInfoDia}>
                    <Text style={styles.InfoDia}>{nomeEstadoDoDia}</Text>
                  </View>
                </View>
              )
              :
              <View style={{height:"100%", width:"100%", alignItems:"center"}}>
                {erro[1]
                ?
                <Text style={{color:"white", fontSize:(0.04*width), marginTop:(0.08*height)}}>Cidade Indisponivel</Text>
                :
                <Text style={{color:"white", fontSize:(0.04*width), marginTop:(0.08*height)}}>Carregando...</Text>
                }
              </View>
              
            }
            </View>

          </View>
        </TouchableWithoutFeedback>

        <View style={styles.previsaoBloco} pointerEvents="box-none">   

          <View>
            <Text style={styles.previsaoNome}>Previsão Semanal</Text>
          </View>

          {tempMin[1] ? (
            <FlatList
              data={diasDosGraus}
              keyExtractor={(item) => {
                return String(item.id)
              } } 
              renderItem={({ item, index }) => {
                return (
                  <View style={{marginBottom:-2}}>
                    <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.3)", margin: 10 }} />
                    <View style={styles.arrumacaoClima}>
                      <Text style={styles.formatacaoClima}>{item.diasDosGraus.substring(0, 3)}</Text>
                      <Image
                        style={{ width: (width*0.075), height: (width*0.075), marginTop: -5 }}
                        source={caminhoEstadoClima[index]}
                      />
                      <Text style={{ color: "white", fontSize: (0.03*width) }}>
                        {Number(tempMin[index])}
                      </Text>
                      <TemperatureBar
                        index={item.id}
                        isSelected={selectedBarIndex === index}
                        onPress={() => handlePress(item.id)}
                      />
                      


                      <Text style={{ color: "white", fontSize: (0.03*width) }}>
                        {Number(tempMax[index])}
                      </Text>
                    </View>
                  </View>
                );
              }}
              onScroll={()=>{
                setSelectedBarIndex(null)
              }}
              initialNumToRender={16}
            />
          ) : (
            
            <View style={{height:"100%", width:"100%", alignItems:"center"}}>
              {erro[1]
              ?
              <Text style={{color:"white", fontSize:(0.04*width), marginTop:(0.15*height)}}>Cidade Indisponivel</Text>
              :
              <Text style={{color:"white", fontSize:(0.04*width), marginTop:(0.15*height)}}>Carregando...</Text>
              }
            </View>
          )}
        </View>

      </LinearGradient>
    </SafeAreaProvider>

  );
}

interface estados{
  id: number,
  sigla: string,
  nome: string,
    regiao: {
      id: number,
      sigla: string,
      nome: string
    }
}

// function HomeScreen2({ navigation }: HomeScreen2Props) {

//   const referencia = useRef(null);
//   const [layout, setLayout] = useState({ x: 0, y: 0 });

//   const handlePress = () => {
//     const viewNodeHandle = findNodeHandle(referencia.current);

//     if (viewNodeHandle) {
//       UIManager.measureInWindow(viewNodeHandle, (x, y, width, height) => {
//         ('X relative to window:', x - layout.x);
//         ('Y relative to window:', y - layout.y);
//         ('Width:', width);
//         ('Height:', height);
//       });
//     }
//   };

//   return (
//     <View
//       style={{ flex: 1}}
//     >
//       <TouchableWithoutFeedback ref={referencia} onPress={handlePress}>
//         <View style={{ height: 200, width: 200, backgroundColor: 'lightblue', marginTop:34.375 }}>
//           <Text>Elemento clicável</Text>
//         </View>
//       </TouchableWithoutFeedback>
//     </View>
//   );
  
// }

const Drawer = createDrawerNavigator<RootDrawerParamList>();

function CustomHeaderLeft() {
  const navigation = useNavigation();
  return (
    <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}>
      <Ionicons
        name="menu"
        size={45}
        color="white"
        style={{ marginLeft: 15 }}
      />
    </TouchableOpacity>
  );
}

export default function App() {
  {Platform.OS === 'android' && (
    <ExpoStatusBar style="light" backgroundColor="rgba(0, 0, 0, 0.0)" translucent={true} />
  )}

  return (
      <Drawer.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: '',
          headerLeft: () => <CustomHeaderLeft />,
        }}
      >
        <Drawer.Screen name="Home" component={HomeScreen} />
        {/* <Drawer.Screen name="Home2" component={HomeScreen2} /> */}
      </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button2: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  button: {
    marginTop: 150,
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  modalView: {
    height:"auto",
    width:(width*0.8),
    paddingTop: 20,
    borderWidth:1,
    borderColor:"black",
    marginTop: -280,
    borderRadius: 20,
    backgroundColor:"white",
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    marginTop: 55,
    marginRight: 20,
    alignItems:'flex-end',
  },
  estiloTexto:{
    color:"white",
    fontWeight:"semibold",
    fontSize:(0.033*width),
  },
  cidadeClima:{
    borderBottomColor:"white",
    borderBottomWidth:2,
    display:"flex",
    justifyContent:"center",
    alignItems:"center",
    maxWidth: (0.65*width),
    minWidth: (0.32*width),
  },
  arrumarCidadeClima:{
    alignItems: "center",
    marginTop:(0.10*height),
    justifyContent:"center",
    display:"flex",
  },
  estiloCidade:{
    fontSize:(0.05*width),
    color:"white",
    fontWeight:'400'
  },
  estiloGraus:{
    color:"white",
    fontSize:(0.12 * width),
    marginTop:10,
    marginLeft:10,
    fontFamily: "segoe-ui"
  },
  imagemGraus:{
    height:(width*0.15),
    width:(width*0.15)
  },
  arrumarGraus:{
    display:'flex',
    flexDirection:"row",
    marginTop:10
  },
  arrumarInfoDia:{
    marginTop:5
  },
  InfoDia:{
    color:"white",
    fontSize:(0.025*width),
    marginRight:50
  },
  previsaoBloco:{
    flex:1,
    backgroundColor:"rgba(255, 255, 255, 0.3)",
    borderTopRightRadius:40,
    borderTopLeftRadius:40,
    height:"auto"
  },
  arrumacaoBarra:{
    backgroundColor:"rgba(0,0,0,0.2)",
    width:(width*0.17),
    height: (height*0.005),
    borderRadius:15,
    marginTop:(height*0.010),
    marginLeft:-12,
    marginRight: -12,
    justifyContent:"center",
    alignItems:"center",
  },
  barra:{
    position: "relative",
    backgroundColor:"#FFB509",
    width: "100%",
    height:5,
    borderRadius:15,
    opacity: 0.5
  },
  currentTempIndicator: {
    height: (height*0.005),
    width: (width*0.06),
    borderRadius: 5,
    position: 'absolute',
    marginLeft: -5,
    marginRight:10,
    marginTop:27.5,
    alignItems:"center"
  },
  arrumacaoClima:{
    display:"flex",
    flexDirection:"row",
    justifyContent:"space-around",
    margin:10
  },
  formatacaoClima:{
    fontSize:(0.03*width),
    color:"white"
  },
  previsaoNome:{
    textAlign:"center",
    fontSize:(0.045*width),
    color:"white",
    marginTop:14,
    marginBottom:(height*0.005)
  },
  botaoBuscarClima:{
    backgroundColor:"#24B1C7",
    marginTop:(0.035*height),
    marginBottom:(0.035*height),
    height:(height*0.05),
    width:(width*0.39),
    borderRadius:(0.02*width),
  }
});
