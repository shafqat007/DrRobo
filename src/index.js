import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Picker } from '@react-native-picker/picker';
import { ref, set, push } from 'firebase/database';
import { db } from '../config';
import Icon from 'react-native-vector-icons/FontAwesome'; //  As suming you're using FontAwesome icons

const FetchData = ({ navigation }) => {
  const [options, setOptions] = useState([{ hours: '', minutes: '', period: 'AM', label: 'Med 1', name: '', time: '' }]);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const period = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = ((hours % 12) || 12).toString().padStart(2, '0');
      setCurrentTime(`${formattedHours}:${minutes} ${period}`);

      // Check if any medicine time matches the current time
      const match = options.find(option => option.time === `${formattedHours}:${minutes} ${period}`);
      if (match) {
        // Show alert only once when the current time matches medicine time
        setTimeout(() => {
          Alert.alert('Take Medicine', `It's time to take ${match.label} "${match.name}"`);
        }, 1000); // Delay of 1 second to ensure the alert shows at the exact time
      }
    }, 1000); // Update time every second

    return () => clearInterval(intervalId);
  }, [currentTime, options]);

  const addOption = () => {
    const newOptions = [...options, { hours: '', minutes: '', period: 'AM', label: `Med ${options.length + 1}`, name: '', time: '' }];
    setOptions(newOptions);
  };

  const handleInputChange = (index, fieldName, value) => {
    let newValue = value;
    if (fieldName === 'hours') {
      newValue = isNaN(value) ? '' : Math.max(0, Math.min(12, parseInt(value, 10))).toString();
    }
    if (fieldName === 'minutes') {
      newValue = isNaN(value) ? '' : Math.max(0, Math.min(60, parseInt(value, 10))).toString();
    }
    const newOptions = [...options];
    newOptions[index][fieldName] = newValue;
    // Set the time property based on the input hours, minutes, and period
    const formattedHours = newOptions[index].hours.toString().padStart(2, '0');
    newOptions[index].time = `${formattedHours}:${newOptions[index].minutes.padStart(2, '0')} ${newOptions[index].period}`;
    setOptions(newOptions);
  };

  const deleteOption = (indexToDelete) => {
    const newOptions = options.filter((_, index) => index !== indexToDelete);
    // Update labels ds
    for (let i = indexToDelete; i < newOptions.length; i++) {
      newOptions[i].label = `Med ${i + 1}`;
    }
    setOptions(newOptions);
  };

  const saveOptionsToFirebase = () => {
    options.forEach((option) => {
      if (option.hours.trim() !== '' && option.minutes.trim() !== '') {
        push(ref(db, 'Options'), {
          label: option.label,
          name: option.name,
          time: option.time,
        })
          .then(() => {
            console.log('Data pushed successfully:', option);
          })
          .catch((error) => {
            console.error('Error pushing data:', error);
          });
      }
    });
    setSuccessMessage('Medicine saved successfully!');
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
    // Overwrite previous data in the database
    set(ref(db, 'Options'), options)
      .then(() => {
        console.log('Data set successfully:', options);
      })
      .catch((error) => {
        console.error('Error setting data:', error);
      });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="light" />
      <View style={styles.headerContainer}>
        <Text style={styles.header}>roboDoc</Text>
      </View>
      <Text style={styles.subHeader}>Set the time for each medicine</Text>
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <View key={index} style={styles.optionRow}>
            {options.length > 1 && (
              <Icon
                name="minus"
                size={20}
                color="#ffffff"
                style={styles.deleteIcon}
                onPress={() => deleteOption(index)}
              />
            )}
            <Text style={styles.optionLabel}>{option.label}</Text>
            <TextInput
              style={styles.nameInput}
              placeholder="Med Name"
              value={option.name}
              onChangeText={(value) => handleInputChange(index, 'name', value)}
            />
            <View style={styles.timeInputContainer}>
              <TextInput
                style={styles.timeInput}
                placeholder="HH"
                value={option.hours}
                keyboardType="numeric"
                maxLength={2}
                onChangeText={(value) => handleInputChange(index, 'hours', value)}
              />
              <Text style={styles.colon}>:</Text>
              <TextInput
                style={styles.timeInput}
                placeholder="MM"
                value={option.minutes}
                keyboardType="numeric"
                maxLength={2}
                onChangeText={(value) => handleInputChange(index, 'minutes', value)}
              />
             <Picker
  style={styles.periodPicker}
  selectedValue={option.period}
  onValueChange={(value) => handleInputChange(index, 'period', value)}
  dropdownIconColor="#ffffff" // Set the dropdown arrow color to white
>
  <Picker.Item label="AM" value="AM" />
  <Picker.Item label="PM" value="PM" />
</Picker>

            </View>
            {index === options.length - 1 && (
              <Icon
                name="plus"
                size={20}
                color="#ffffff"
                style={styles.addIcon}
                onPress={addOption}
              />
            )}
          </View>
        ))}
        <TouchableOpacity style={styles.saveOptionsButton} onPress={saveOptionsToFirebase}>
          <Text style={styles.saveOptionsText}>Save Medicine Data</Text>
        </TouchableOpacity>
        <Text style={styles.currentTime}>{currentTime}</Text>
        {successMessage ? <Text style={styles.successMessage}>{successMessage}</Text> : null}
      </View>
    </ScrollView>
  );
};

export default FetchData;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#1f1f1f',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 150
  },
  headerContainer: {
    marginBottom: 20,
  },
  header: {
    fontSize: 48,
    color: '#ffffff',
    fontFamily: 'Roboto',
  },
  subHeader: {
    color: '#ffffff',
    fontSize: 20,
    marginBottom: 20,
    fontFamily: 'Roboto',
  },
  optionsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', // Align items to the start of the row
    marginBottom: 15,
    width: '100%',
  },
  optionLabel: {
    color: '#ffffff',
    fontSize: 18,
    marginRight: 10,
    fontFamily: 'Roboto',
  },
  nameInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    width: 100,
    textAlign: 'center',
    marginRight: 5,
    borderRadius: 5,
    fontSize: 18,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    width: 40,
    textAlign: 'center',
    marginRight: 5,
    borderRadius: 5,
    fontSize: 18,
  },
  colon: {
    color: '#ffffff',
    fontSize: 18,
    marginRight: 5,
  },
  periodPicker: {
    color: '#ffffff',
    width: 30,
   
  },
  addIcon: {
    marginLeft: 10,
    marginRight: 10, // Adjust margin to create space between the plus icon and the last medicine item
  },
  deleteIcon: {
    marginRight: 10,
  },
  saveOptionsButton: {
    backgroundColor: '#469b82',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  saveOptionsText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Roboto',
  },
  currentTime: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Roboto',
    marginTop: 10,
  },
  successMessage: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Roboto',
    marginTop: 10,
  },
});