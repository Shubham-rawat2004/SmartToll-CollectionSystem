package com.example.gitpractice.service;

import com.example.gitpractice.dto.CreateTaskRequest;
import com.example.gitpractice.model.Task;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class TaskService {

    private final List<Task> tasks = new ArrayList<>();
    private final AtomicLong idGenerator = new AtomicLong();

    public TaskService() {
        tasks.add(new Task(idGenerator.incrementAndGet(), "Learn git status", "Inspect working tree changes", false));
        tasks.add(new Task(idGenerator.incrementAndGet(), "Practice git add", "Stage one file at a time", false));
    }

    public List<Task> getAllTasks() {
        return tasks;
    }

    public Task createTask(CreateTaskRequest request) {
        Task task = new Task(
                idGenerator.incrementAndGet(),
                request.title(),
                request.description(),
                false
        );
        tasks.add(task);
        return task;
    }
}
