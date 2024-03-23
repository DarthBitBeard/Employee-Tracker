const inquirer = require('inquirer');
const mysql = require('mysql2');
const consoleTable = require('console.table');

require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

connection.connect(err => {
  if (err) throw err;
  console.log('Connected to the MySQL server.');
  start();
});

function start() {
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
      'Update employee manager',
      'View employees by manager',
      'View employees by department',
      'Delete a department',
      'Delete a role',
      'Delete an employee',
      'View total utilized budget of a department',
      'Exit'
    ]
  }).then(answer => {
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
      case 'Update employee manager':
        updateEmployeeManager();
        break;
      case 'View employees by manager':
        viewEmployeesByManager();
        break;
      case 'View employees by department':
        viewEmployeesByDepartment();
        break;
      case 'Delete a department':
        deleteDepartment();
        break;
      case 'Delete a role':
        deleteRole();
        break;
      case 'Delete an employee':
        deleteEmployee();
        break;
      case 'View total utilized budget of a department':
        viewTotalBudget();
        break;
      case 'Exit':
        connection.end();
        break;
    }
  });
}

function viewDepartments() {
  const query = 'SELECT * FROM departments';
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
  });
}

function viewRoles() {
  const query = 'SELECT roles.id, roles.title, roles.salary, departments.name AS department FROM roles INNER JOIN departments ON roles.department_id = departments.id';
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
  });
}

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
  
  function viewEmployeesByManager() {
    inquirer.prompt({
      name: 'manager_id',
      type: 'input',
      message: 'Enter the ID of the manager to view their employees:'
    }).then(answer => {
      const query = `SELECT employees.id, employees.first_name, employees.last_name, roles.title
                     FROM employees
                     INNER JOIN roles ON employees.role_id = roles.id
                     WHERE employees.manager_id = ?`;
      connection.query(query, [answer.manager_id], (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
      });
    });
  }
  
  function viewEmployeesByDepartment() {
    inquirer.prompt({
      name: 'department_id',
      type: 'input',
      message: 'Enter the ID of the department to view its employees:'
    }).then(answer => {
      const query = `SELECT employees.id, employees.first_name, employees.last_name, roles.title
                     FROM employees
                     INNER JOIN roles ON employees.role_id = roles.id
                     WHERE roles.department_id = ?`;
      connection.query(query, [answer.department_id], (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
      });
    });
  }

  function viewTotalBudget() {
    inquirer.prompt({
      name: 'department_id',
      type: 'input',
      message: 'Enter the ID of the department to view its total utilized budget:'
    }).then(answer => {
      const query = `SELECT SUM(roles.salary) AS total_budget
                     FROM employees
                     INNER JOIN roles ON employees.role_id = roles.id
                     WHERE roles.department_id = ?`;
      connection.query(query, [answer.department_id], (err, res) => {
        if (err) throw err;
        console.log(`Total utilized budget of the department: $${res[0].total_budget}`);
        start();
      });
    });
  }
  