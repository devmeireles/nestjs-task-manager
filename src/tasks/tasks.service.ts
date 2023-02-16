import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../auth/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';
import { TaskRepository } from './task.repository';

@Injectable()
export class TasksService {
  @InjectRepository(TaskRepository)
  private taskRepository: TaskRepository;
  private logger: Logger;

  constructor(taskRepository: TaskRepository) {
    this.taskRepository = taskRepository;
    this.logger = new Logger('TaskRepository')
  }

  async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    this.logger.verbose(`${user.username} getTasks white filters: ${JSON.stringify(filterDto)}`)
    return this.taskRepository.getTasks(filterDto, user);
  }

  async getTaskById(id: number, user: User): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: {
        id,
        userId: user.id
      },
    });

    if (!task) throw new NotFoundException();

    return task;
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    return this.taskRepository.createTask(createTaskDto, user);
  }

  async deleteTask(id: number, user: User): Promise<void> {
    const toRemove = await this.taskRepository.delete({ id, userId: user.id });

    if (toRemove.affected === 0) throw new NotFoundException();
  }

  async updateTaskStatus(id: number, status: TaskStatus, user: User): Promise<Task> {
    const task = await this.getTaskById(id, user);
    task.status = status;
    await task.save();

    return task;
  }
}
