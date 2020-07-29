import React, { Component } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import axios from 'axios';

export default class AuthOrApp extends Component {
    componentDidMount = async () => {
        const userDataJson = await AsyncStorage.getItem('userData');
        let userData = null;

        try {
            userData = JSON.parse(userDataJson);
        } catch (error) {
            // user está inválido
        }
        
        if (userData && userData.token) {
            axios.defaults.headers.common['Authorization'] = `bearer ${userData.token}`;
            this.props.navigation.navigate('Home', userData);
        } else {
            this.props.navigation.navigate('Auth');
        }
    }
    render() {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000'
    }
});
