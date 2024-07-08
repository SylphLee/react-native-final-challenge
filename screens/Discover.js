import React, { useRef, useState, useCallback, useEffect } from 'react';
import styled from "styled-components/native";
import { Animated, PanResponder, View, Easing, Image } from "react-native";


const BLACK_COLOR = "#1e272e";
const GREY = "#485460";
const GREEN = "#2ecc71";
const RED = "#e74c3c";

const Container = styled.View`
  flex: 1;
  background-color: ${BLACK_COLOR};
`;

const Edge = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;  
`;

const WordContainer = styled(Animated.createAnimatedComponent(View))`
  width: 100px;
  height: 100px;
  justify-content: center;
  align-items: center;  
  background-color: ${GREY};  
  border-radius: 50px;
`;

const Word = styled.Text`
  font-size: 38px;
  font-weight: 500;
  color: ${(props) => props.color}
`;

const Center = styled.View`
  flex: 3;
  justify-content: center;
  align-items: center;  
  z-index: 10;
`;

const IconCard = styled(Animated.createAnimatedComponent(View))`
  background-color: white;
  border-radius: 100px;
`;

export default function App() {
  const [coins, setCoins] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const getCoins = useCallback(
    () =>
      fetch('https://api.coinpaprika.com/v1/coins')
        .then((response) => response.json())
        .then((json) => setCoins(json)),
    []
  );
  const onRefresh = async () => {
    setRefreshing(true);
    await getCoins();
    setRefreshing(false)
  };
  useEffect(() => {
    getCoins();
  }, [getCoins]);
  const cleanedCoins = coins
    ?.filter((coin) => coin.rank !== 0)
    .filter((coin) => coin.is_active === true)
    .slice(0, 100);


  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const scaleOne = position.y.interpolate({
    inputRange: [-300, -80],
    outputRange: [2, 1],
    extrapolate: "clamp",
  });

  const scaleTwo = position.y.interpolate({
    inputRange: [80, 300],
    outputRange: [1, 2],
    extrapolate: "clamp",
  });

  const onPressIn = Animated.spring(scale, {
    toValue: 0.9,
    useNativeDriver: true,
  });
  const onPressOut = Animated.spring(scale, {
    toValue: 1,
    useNativeDriver: true,
  });
  const goHome = Animated.spring(position, {
    toValue: 0,
    useNativeDriver: true,
  });

  const onDropScale = Animated.timing(scale, {
    toValue: 0,
    duration: 50,
    easing: Easing.linear,
    useNativeDriver: true,
  });

  const onDropOpacity = Animated.timing(opacity, {
    toValue: 0,
    duration: 50,
    easing: Easing.linear,
    useNativeDriver: true,
  });

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, { dx, dy }) => {
      position.setValue({ x: dx, y: dy });
    },
    onPanResponderGrant: () => {
      onPressIn.start();
    },
    onPanResponderRelease: (_, { dy }) => {
      if (dy < -250 || dy > 250) {
        Animated.sequence([
          Animated.parallel([
            onDropOpacity,
            onDropScale,
          ]),
          Animated.timing(position, {
            toValue: 0,
            duration: 50,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]).start(nextIcon);
      } else {
        Animated.parallel([onPressOut, goHome]).start();
      }
    }
  })).current;

  const [index, setIndex] = useState(0);
  const nextIcon = () => {
    setIndex((prev) => prev + 1);
    Animated.parallel([
      Animated.spring(scale, {toValue:1, useNativeDriver: true}),
      Animated.spring(opacity, {toValue: 1, useNativeDriver: true}),    
    ]).start();    
  }
  return (
    <Container>
      <Edge>
        <WordContainer
          style={{
            transform: [{ scale: scaleOne }]
          }}
        >
          <Word color={GREEN}>사다</Word>
        </WordContainer>
      </Edge>
      <Center>
        <IconCard
          {...panResponder.panHandlers}
          style={{
            opacity,
            transform: [
              ...position.getTranslateTransform(),
              { scale }
            ]
          }}>
          <Image
            key={index + 1}
            style={{
              width: 200,
              height: 200,             
            }}
            source={{
              uri: `https://static.coinpaprika.com/coin/${cleanedCoins[index]?.id}/logo.png`,
            }}
          />          
        </IconCard>
      </Center>
      <Edge>
        <WordContainer
          style={{
            transform: [{ scale: scaleTwo }]
          }}
        >
          <Word color={RED}>팔다</Word>
        </WordContainer>
      </Edge>
    </Container>
  );
}

