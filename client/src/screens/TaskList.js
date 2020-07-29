import React, { Component } from 'react';
import { View, Text, ImageBackground, StyleSheet, FlatList, TouchableOpacity, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import moment from 'moment';
import 'moment/locale/pt-br';
import axios from 'axios';

import todayImage from '../../assets/imgs/today.jpg';
import tomorrowImage from '../../assets/imgs/tomorrow.jpg';
import weekImage from '../../assets/imgs/week.jpg';
import monthImage from '../../assets/imgs/month.jpg';
import commonStyles from '../commonStyles';
import Task from '../components/Task';
import AddTask from './AddTask';
import { server, showError } from '../commons';

const initialState = {
    tasks: [],
    visibleTasks: [],
    showDoneTasks: true,
    showAddTask: false
}
const today = moment().locale('pt-br').format('ddd, D [de] MMMM');

export default class TaskList extends Component {
    state = {
        ...initialState
    }

    componentDidMount = async () => {
        const stringState = await AsyncStorage.getItem('tasksState'); 

        const savedState = JSON.parse(stringState) || initialState;

        this.setState({showDoneTasks: savedState.showDoneTasks}, this.filterTasks);

        this.loadTasks();
    }

    toggleFilter = () => {
        this.setState({showDoneTasks: !this.state.showDoneTasks}, this.filterTasks);
    }

    filterTasks = () => {
        let visibleTasks = null;

        if (this.state.showDoneTasks) {
            visibleTasks = [...this.state.tasks];
        } else {
            const pending = task => task.doneAt === null;
            visibleTasks = this.state.tasks.filter(pending);
        }

        this.setState({visibleTasks});
        AsyncStorage.setItem('tasksState', JSON.stringify({showDoneTasks: this.state.showDoneTasks}));
    }

    toggleTask = async taskId => {
        try {
            await axios.put(`${server}/tasks/${taskId}/toggle`);
            this.loadTasks();
        } catch (error) {
            showError(error);
        }
    }

    addTask = async newTask => {
        if (!newTask.desc || !newTask.desc.trim()) {
            Alert.alert('Dados Inválidos', 'Descrição não informada.');
            return;
        }

        try {
            await axios.post(`${server}/tasks`, {
                desc: newTask.desc,
                estimateAt: newTask.date 
            });

            this.setState({showAddTask: false}, this.loadTasks);
        } catch (error) {
            showError(error);
        }

    }

    deleteTask = async taskId => {
        try {
            await axios.delete(`${server}/tasks/${taskId}`);
            this.loadTasks();
        } catch (error) {
            showError(error);
        }
    }

    loadTasks = async () => {
        try {
            const maxDate = moment().add({days: this.props.daysAhead}).format('YYYY-MM-DD 23:59:59');
            const res = await axios.get(`${server}/tasks?date=${maxDate}`);

            this.setState({tasks: res.data}, this.filterTasks);
        } catch (error) {   
            showError(error);
        }
    }

    getImage = () => {
        switch (this.props.daysAhead) {
            case 0: return todayImage
            case 1: return tomorrowImage
            case 7: return weekImage
            default: return monthImage
        }
    }

    getColor = () => {
        switch (this.props.daysAhead) {
            case 0: return commonStyles.colors.today
            case 1: return commonStyles.colors.tomorrow
            case 7: return commonStyles.colors.week
            default: return commonStyles.colors.month
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <AddTask 
                    isVisible={this.state.showAddTask} 
                    onCancel={() => this.setState({showAddTask: false})} 
                    onSave={this.addTask}
                />
                <ImageBackground style={styles.background} source={this.getImage()}>
                    <View style={styles.iconBar}>
                        <TouchableOpacity onPress={() => this.props.navigation.openDrawer()}>
                            <Icon 
                                name='bars' 
                                size={20} 
                                color={commonStyles.colors.secondary} 
                            /> 
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.toggleFilter}>
                            <Icon 
                                name={this.state.showDoneTasks ? 'eye' : 'eye-slash'} 
                                size={20} 
                                color={commonStyles.colors.secondary} 
                            /> 
                        </TouchableOpacity>
                    </View>
                    <View style={styles.titleBar}>
                        <Text style={styles.title}>{this.props.title}</Text>
                        <Text style={styles.subtitle}>{today}</Text>
                    </View>
                </ImageBackground>
                <View style={styles.taskList}>
                    <FlatList 
                        data={this.state.visibleTasks} 
                        keyExtractor={item => `${item.id}`} 
                        renderItem={({ item }) => (
                            <Task {...item} onToggleTask={this.toggleTask} onDelete={this.deleteTask} />
                        )}
                    /> 
                </View>
                <TouchableOpacity 
                    activeOpacity={0.8} 
                    style={[styles.addButton, { backgroundColor: this.getColor() }]} 
                    onPress={() => this.setState({showAddTask: true})}
                >
                    <Icon name="plus" size={20} color={commonStyles.colors.secondary} />
                </TouchableOpacity>
            </View>
        );
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    background: {
        flex: 3
    },
    titleBar: {
        flex: 1,
        justifyContent: 'flex-end'
    },
    title: {
        fontFamily: commonStyles.fontFamily,
        fontSize: 50,
        color: commonStyles.colors.secondary,
        marginBottom: 20,
        marginLeft: 20
    },
    subtitle: {
        fontFamily: commonStyles.fontFamily,
        fontSize: 20,
        color: commonStyles.colors.secondary,
        marginBottom: 30,
        marginLeft: 20
    },
    taskList: {
        flex: 7
    },
    iconBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 20,
        marginTop: Platform.OS === 'ios' ? 40 : 10
    },
    addButton: {
        position: 'absolute',
        right: 30,
        bottom: 30,
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center'
    }
});
