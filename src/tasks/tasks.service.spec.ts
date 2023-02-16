import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { User } from '../auth/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { TaskRepository } from './task.repository';
import { TasksService } from './tasks.service';

const mockUser: Partial<User> = {
    username: 'testuser',
    id: 1,
    password: 'aReallyStrongPassw0rd!',
    tasks: [],
}

const mockTaskRepository = () => ({
    getTasks: jest.fn(),
    findOne: jest.fn(),
    createTask: jest.fn(),
    delete: jest.fn(),
    updateTask: jest.fn(),
});

describe('TasksService', () => {
    let tasksService: TasksService;
    let taskRepository;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                TasksService,
                {
                    provide: TaskRepository,
                    useFactory: mockTaskRepository
                }
            ]
        }).compile();

        tasksService = await module.get<TasksService>(TasksService);
        taskRepository = await module.get<TaskRepository>(TaskRepository);
    });

    describe('getTasks', () => {
        it('gets all tasks from repository', async () => {
            taskRepository.getTasks.mockResolvedValue('someVal');

            expect(taskRepository.getTasks).not.toHaveBeenCalled();

            const filters: GetTasksFilterDto = {
                status: TaskStatus.IN_PROGRESS,
                search: 'some search query'
            };

            const result = await tasksService.getTasks(filters, mockUser as User);
            expect(taskRepository.getTasks).toHaveBeenCalled();
            expect(result).toEqual('someVal');
        });
    });

    describe('getTaskById', () => {
        it('successfully retrieve and return the task by id', async () => {
            const mockTask = {
                title: 'test task',
                desciption: 'cool task buddy',
            };

            taskRepository.findOne.mockResolvedValue(mockTask);

            const result = await tasksService.getTaskById(1, mockUser as User);
            expect(result).toEqual(mockTask)
            expect(taskRepository.findOne).toHaveBeenCalledWith({
                where: {
                    id: 1,
                    userId: mockUser.id
                }
            });
        });

        it('throws an error as tasks is not found', () => {
            taskRepository.findOne.mockResolvedValue(null);
            expect(tasksService.getTaskById(1, mockUser as User)).rejects.toThrow(NotFoundException);
        })
    });

    describe('createTask', () => {
        it('it creates and returns a task', async () => {
            taskRepository.createTask.mockResolvedValue('someTask');

            expect(taskRepository.createTask).not.toHaveBeenCalled();

            const createTaskDto: CreateTaskDto = {
                title: 'new task',
                description: 'desc for task'
            };

            const result = await tasksService.createTask(createTaskDto, mockUser as User);
            expect(taskRepository.createTask).toHaveBeenCalledWith(createTaskDto, mockUser)
            expect(result).toEqual('someTask');
        })
    });

    describe('deleteTask', () => {
        it('it deletes a task', async () => {
            taskRepository.delete.mockResolvedValue({
                affected: 1
            });

            expect(taskRepository.delete).not.toHaveBeenCalled();

            await tasksService.deleteTask(1, mockUser as User);
            expect(taskRepository.delete).toHaveBeenCalledWith({
                id: 1,
                userId: mockUser.id
            });
        });

        it('throws an error as task could not be found', async () => {
            taskRepository.delete.mockResolvedValue({
                affected: 0
            });

            expect(tasksService.deleteTask(1, mockUser as User)).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateTaskStatus', () => {
        it('it updates a and return a task', async () => {
            const save = jest.fn().mockResolvedValue(true);
            tasksService.getTaskById = jest.fn().mockResolvedValue({
                status: TaskStatus.OPEN,
                save,
            });

            expect(tasksService.getTaskById).not.toHaveBeenCalled();
            expect(save).not.toHaveBeenCalled();
            const result = await tasksService.updateTaskStatus(1, TaskStatus.DONE, mockUser as User);
            expect(tasksService.getTaskById).toHaveBeenCalled();
            expect(save).toHaveBeenCalled();
            expect(result.status).toEqual(TaskStatus.DONE);
        });
    });
});