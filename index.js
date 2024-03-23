const inquirer = require('inquirer');
const mysql = require('mysql2');
const consoleTable = require('console.table');

// Create a MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Password',
    database: 'employee_db'
});

// Connect to the database
connection.connect(err => {
    if (err) throw err;
    console.log('Connected to the MySQL server.');
    start();
});

// Function to start the application
function start() {
  // Prompt user for action choice
    inquirer.prompt({
        name: 'action',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
            'View all departments',
            'View all roles',
            'View all employees',
            'Add a department',
            'Add a role',
            'Add an employee',
            'Update an employee role',
            'Exit'
    ]
    }).then(answer => {
    // Call appropriate function based on user's choice
    switch (answer.action) {
        case 'View all departments':
            viewDepartments();
            break;
        case 'View all roles':
            viewRoles();
            break;
        case 'View all employees':
            viewEmployees();
            break;
        case 'Add a department':
            addDepartment();
            break;
        case 'Add a role':
            addRole();
            break;
        case 'Add an employee':
            addEmployee();
            break;
        case 'Update an employee role':
            updateEmployeeRole();
            break;
        case 'Exit':
            connection.end();
            break;
        }
    });
}

// Function to view all departments
function viewDepartments() {
  const query = 'SELECT * FROM departments';
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
    });
}

// Function to view all roles
function viewRoles() {
    const query = 'SELECT roles.id, roles.title, roles.salary, departments.name AS department FROM roles INNER JOIN departments ON roles.department_id = departments.id';
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
    });
}

// Function to view all employees
function viewEmployees() {
    const query = `SELECT employees.id, employees.first_name, employees.last_name, roles.title, departments.name AS department, roles.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
                FROM employees
                LEFT JOIN roles ON employees.role_id = roles.id
                LEFT JOIN departments ON roles.department_id = departments.id
                LEFT JOIN employees AS manager ON employees.manager_id = manager.id`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
    });
}

// Function to add a department
function addDepartment() {
    inquirer.prompt({
        name: 'name',
        type: 'input',
        message: 'Enter the name of the department:'
    }).then(answer => {
        const query = 'INSERT INTO departments SET ?';
        connection.query(query, { name: answer.name }, (err, res) => {
        if (err) throw err;
        console.log('Department added successfully!');
        start();
    });
    });
}

// Function to add a role
function addRole() {
    inquirer.prompt([
        {
        name: 'title',
        type: 'input',
        message: 'Enter the title of the role:'
    },
    {
        name: 'salary',
        type: 'input',
        message: 'Enter the salary for this role:'
    },
    {
        name: 'department_id',
        type: 'input',
        message: 'Enter the department ID for this role:'
    }
    ]).then(answer => {
    const query = 'INSERT INTO roles SET ?';
    connection.query(query, { title: answer.title, salary: answer.salary, department_id: answer.department_id }, (err, res) => {
        if (err) throw err;
        console.log('Role added successfully!');
        start();
    });
    });
}

// Function to add an employee
function addEmployee() {
    inquirer.prompt([
    {
        name: 'first_name',
        type: 'input',
        message: "Enter the employee's first name:"
    },
    {
        name: 'last_name',
        type: 'input',
        message: "Enter the employee's last name:"
    },
    {
        name: 'role_id',
        type: 'input',
        message: "Enter the employee's role ID:"
    },
    {
        name: 'manager_id',
        type: 'input',
        message: "Enter the employee's manager ID (if applicable):"
    }
    ]).then(answer => {
        const query = 'INSERT INTO employees SET ?';
        connection.query(query, { first_name: answer.first_name, last_name: answer.last_name, role_id: answer.role_id, manager_id: answer.manager_id }, (err, res) => {
            if (err) throw err;
            console.log('Employee added successfully!');
            start();
    });
    });
}

// Function to update an employee role
function updateEmployeeRole() {
    inquirer.prompt([
    {
        name: 'employee_id',
        type: 'input',
        message: 'Enter the ID of the employee you want to update:'
    },
    {
        name: 'new_role_id',
        type: 'input',
        message: 'Enter the new role ID for the employee:'
    }
    ]).then(answer => {
    const query = 'UPDATE employees SET role_id = ? WHERE id = ?';
    connection.query(query, [answer.new_role_id, answer.employee_id], (err, res) => {
        if (err) throw err;
        console.log('Employee role updated successfully!');
        start();
    });
    });
}
