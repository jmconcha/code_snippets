import React from 'react';
import ReactDOM from 'react-dom';
import { v4 as uuidv4 } from 'uuid';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider, connect } from 'react-redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import logger from 'redux-logger';

const todo = (state = {}, action) => {
	switch (action.type) {
		case 'ADD_TODO':
			return {
				id: action.id,
				text: action.text,
				completed: false
			};
		case 'TOGGLE_TODO':
			if (state.id === action.id) {
				return {
					...state,
					completed: !state.completed
				};
			}
			return state;
		default:
			return state;
	}
};

const todos = (state = [], action) => {
	switch (action.type) {
		case 'ADD_TODO':
			return [
				...state,
				todo(undefined, action)
			];
		case 'TOGGLE_TODO':
			return state.map(t => todo(t, action));
		default:
			return state;
	}
};

const visibilityFilter = (state = 'SHOW_ALL', action) => {
	switch (action.type) {
		case 'SET_VISIBILITY_FILTER':
			return action.filter;
		default:
			return state;
	}
};
const todoApp = combineReducers({ todos, visibilityFilter });

const getVisibleTodos = (todos, filter) => {
	switch (filter) {
		case 'SHOW_ALL':
			return todos;
		case 'SHOW_COMPLETED':
			return todos.filter(t => t.completed);
		case 'SHOW_ACTIVE':
			return todos.filter(t => !t.completed);
		default:
			return todos;
	}
};

const setVisibilityFilter = (filter) => {
	return {
		type: 'SET_VISIBILITY_FILTER',
		filter
	};
};

const toggleTodo = (id) => {
	return {
		type: 'TOGGLE_TODO',
		id
	};
};

const addTodo = (text) => {
	return {
		type: 'ADD_TODO',
		id: uuidv4(),
		text
	}
};

const Link = ({ active, onClick, children }) => {
	if (active) {
		return (
			<span>
				{children}
			</span>
		);
	}

	return (
		<a href="#" onClick={e => {
			e.preventDefault();
			onClick();
		}}>
			{children}
		</a>
	);

};

const mapStateToLinkProps = (state, ownProps) => {
	return {
		active: ownProps.filter === state.visibilityFilter
	};
};

const mapDispatchToLinkProps = (dispatch, ownProps) => {
	return {
		onClick: () => {
			dispatch(
				setVisibilityFilter(ownProps.filter)
			)
		}
	};
};

const FilterLink = connect(
	mapStateToLinkProps,
	mapDispatchToLinkProps
)(Link);

const Todo = ({ onClick, text, completed }) => {
	return (
		<li 
			onClick={onClick}
			style={{
				textDecoration: completed ? 'line-through' : 'none'
			}}
		>
			{text}
		</li>
	);
};

let AddTodo = ({ dispatch }) => {
	let input;

	return (
		<div>
			<input 
				ref={node => input = node}
			/>
			<button onClick={() => {
				dispatch(
					addTodo(input.value)
				);
				input.value = '';
			}}>
				Add Todo
			</button>
		</div>
	);
};
AddTodo = connect()(AddTodo);

const TodoList = ({ todos, onTodoClick }) => {
	return (
		<ul>
			{todos.map(todo => 
				<Todo 
					key={todo.id}
					onClick={() => onTodoClick(todo.id)}
					{...todo}
				/>
			)}
		</ul>
	);
};

const mapStateToTodoListProps = (state) => {
	return {
		todos: getVisibleTodos(state.todos, state.visibilityFilter)
	};
};

const mapDispatchToTodoListProps = (dispatch) => {
	return {
		onTodoClick: (id) => {
			dispatch(
				toggleTodo(id)
			)
		}	
	};
};

const VisibleTodoList = connect(
	mapStateToTodoListProps,
	mapDispatchToTodoListProps
)(TodoList);

const Footer = ({ 
	visibilityFilter, 
	onFilterClick 
}) => {
	return (
		<p>
			Show: 
			{' '}
			<FilterLink 
				filter="SHOW_ALL"
			>
				All
			</FilterLink>
			{', '}
			<FilterLink 
				filter="SHOW_COMPLETED"
			>
				Completed
			</FilterLink>
			{', '}
			<FilterLink 
				filter="SHOW_ACTIVE"
			>
				Active
			</FilterLink>
		</p>
	);
};

const TodoApp = () => {
	return (
		<div>
			<AddTodo />
			<VisibleTodoList />
			<Footer />
		</div>
	);
}

ReactDOM.render(
	<Provider 
		store={
			createStore(
				todoApp,
				composeWithDevTools(
					applyMiddleware(logger)
				)
			)
		}
	>
		<TodoApp />
	</Provider>,
	document.getElementById('root')
);








































