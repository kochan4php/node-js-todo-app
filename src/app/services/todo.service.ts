/**
 * @description This file contain all functions to interact with todos collection in MongoDB database
 * @author {Deo Sbrn}
 */

import mongoose, { FilterQuery, ProjectionType, UpdateQuery } from 'mongoose';
import { TodoModel } from '../models';
import { Todo } from '../models/todo.model';

/**
 * @description Get all todos
 * @param {FilterQuery<Todo>} filter - Filter query
 * @returns {Promise<Todo[]>} - Array of todos
 */
async function getAllTodos(filter: FilterQuery<Todo> = {}): Promise<Todo[]> {
    return await TodoModel.find(filter);
}

/**
 * @description Get one todo by id
 * @param {string | mongoose.Types.ObjectId} id - Todo id
 * @param {ProjectionType<Todo>} selectedField - Selected field
 * @returns {Promise<Todo | null>} - Todo object or null
 */
async function getOneTodoById(id: string | mongoose.Types.ObjectId, selectedField: ProjectionType<Todo> = {}): Promise<Todo | null> {
    return await getOneTodo({ _id: id }, selectedField);
}

/**
 * @description Get one todo by filter
 * @param {FilterQuery<Todo>} filter - Filter query
 * @param {ProjectionType<Todo>} selectedField - Selected field
 * @returns {Promise<Todo | null>} - Todo object or null
 */
async function getOneTodo(filter: FilterQuery<Todo> = {}, selectedField: ProjectionType<Todo> = {}): Promise<Todo | null> {
    return await TodoModel.findOne(filter, selectedField);
}

/**
 * @description Create new todo
 * @param {Todo | object} data - Todo data
 * @returns {Promise<Todo>} - Todo object
 */
async function createTodo(data: Todo | object): Promise<Todo> {
    return await TodoModel.create(data);
}

/**
 * @description Update todo by id
 * @param {string | mongoose.Types.ObjectId} id - Todo id
 * @param {UpdateQuery<Todo>} data - Todo data
 * @returns {Promise<Todo | null>} - Todo object or null
 */
async function updateOneTodoById(id: string | mongoose.Types.ObjectId, data: UpdateQuery<Todo>): Promise<Todo | null> {
    return await TodoModel.findByIdAndUpdate(id, data, { new: true });
}

/**
 * @description Update todo by filter
 * @param {FilterQuery<Todo>} filter - Filter query
 * @param {UpdateQuery<Todo>} data - Todo data
 * @returns {Promise<any>} - Todo object or null
 */
async function updateOneTodo(filter: FilterQuery<Todo>, data: UpdateQuery<Todo>): Promise<any> {
    return await TodoModel.updateOne(filter, data, { new: true });
}

/**
 * @description Delete one todo by filter
 * @param {FilterQuery<Todo>} filter - Filter query
 * @returns {Promise<any>} - Result
 */
async function deleteOneTodo(filter: FilterQuery<Todo>): Promise<any> {
    return await TodoModel.deleteOne(filter);
}

/**
 * @description Delete one todo by id
 * @param {string | mongoose.Types.ObjectId} id - Todo id
 * @returns {Promise<Todo | null>} - Todo object or null
 */
async function deleteOneTodoById(id: string | mongoose.Types.ObjectId): Promise<Todo | null> {
    return await TodoModel.findByIdAndDelete(id);
}

export default {
    createTodo,
    deleteOneTodo,
    deleteOneTodoById,
    getAllTodos,
    getOneTodo,
    getOneTodoById,
    updateOneTodo,
    updateOneTodoById,
};
