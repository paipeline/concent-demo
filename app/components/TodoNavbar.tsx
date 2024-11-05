import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface Props {
  phoneFlipped: boolean;
}

export default function TodoNavbar({ phoneFlipped }: Props) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const slideAnim = useState(new Animated.Value(1000))[0];

  useEffect(() => {
    if (phoneFlipped && isOpen) {
      toggleNavbar();
    }
  }, [phoneFlipped]);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
    Animated.spring(slideAnim, {
      toValue: isOpen ? 1000 : 0,
      useNativeDriver: true,
    }).start();
  };

  const addTodo = () => {
    if (newTodo.trim()) {
      const newTodos = [
        ...todos,
        { id: Date.now().toString(), text: newTodo.trim(), completed: false }
      ];
      setTodos(newTodos);
      setNewTodo('');
    }
  };

  const toggleTodo = (id: string) => {
    const newTodos = todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(newTodos);
  };

  const deleteTodo = (id: string) => {
    const newTodos = todos.filter(todo => todo.id !== id);
    setTodos(newTodos);
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.menuButton}
        onPress={toggleNavbar}
      >
        <MaterialIcons 
          name={isOpen ? "close" : "format-list-bulleted"}
          size={28} 
          color="#673AB7"
        />
      </TouchableOpacity>

      <Animated.View 
        style={[
          styles.navbar,
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View style={styles.todoContainer}>
          <Text style={styles.todoTitle}>待办事项</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={newTodo}
              onChangeText={setNewTodo}
              placeholder="添加新任务..."
              placeholderTextColor="#999"
            />
            <TouchableOpacity 
              style={styles.addButton}
              onPress={addTodo}
            >
              <MaterialIcons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.todoList}>
            {todos.map(todo => (
              <TouchableOpacity
                key={todo.id}
                style={[styles.todoItem, todo.completed && styles.todoCompleted]}
                onPress={() => toggleTodo(todo.id)}
              >
                <MaterialIcons
                  name={todo.completed ? "check-box" : "check-box-outline-blank"}
                  size={24}
                  color={todo.completed ? "#673AB7" : "#666"}
                />
                <Text style={[styles.todoText, todo.completed && styles.todoTextCompleted]}>
                  {todo.text}
                </Text>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => deleteTodo(todo.id)}
                >
                  <MaterialIcons name="delete" size={20} color="#FF5252" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  navbar: {
    position: 'absolute',
    bottom: 50,
    left: '10%',
    height: '50%',
    width: '80%',
    backgroundColor: '#f5f5f5',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderRadius: 20,
  },
  menuButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    zIndex: 1001,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todoContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 20,
  },
  todoTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    marginRight: 10,
    fontSize: 15,
  },
  addButton: {
    backgroundColor: '#673AB7',
    justifyContent: 'center',
    alignItems: 'center',
    width: 45,
    borderRadius: 10,
  },
  todoList: {
    flex: 1,
    paddingHorizontal: 5,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  todoCompleted: {
    backgroundColor: '#f8f8f8',
  },
  todoText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  deleteButton: {
    padding: 8,
  },
});