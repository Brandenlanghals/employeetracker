const { prompt } = require("inquirer");
const logo = require("asciiart-logo");
const db = require("./db");
const inquirer = require("inquirer");
require("console.table");

init();

// Display logo text, load main prompts
function init() {
  const logoText = logo({ name: "Employee Manager" }).render();

  console.log(logoText);

  loadMainPrompts();
}
//Prompts 
async function loadMainPrompts() {
  const { choice } = await prompt([
    {
      type: "list",
      name: "choice",
      message: "What would you like to do?",
      choices: [
        {
          name: "View All Employees",
          value: "VIEW_EMPLOYEES"
        },
        {
          name: "Add Employee",
          value: "ADD_EMPLOYEE"
        },
        {
          name: "Remove Employee",
          value: "REMOVE_EMPLOYEE"
        },
        {
          name: "Update Employee Role",
          value: "UPDATE_EMPLOYEE_ROLE"
        },
        {
          name: "View All Roles",
          value: "VIEW_ROLES"
        },
        {
          name: "Add Role",
          value: "ADD_ROLE"
        },
        {
          name: "Remove Role",
          value: "REMOVE_ROLE"
        },
        {
          name: "View All Departments",
          value: "VIEW_DEPARTMENTS"
        },
        {
          name: "Add Department",
          value: "ADD_DEPARTMENT"
        },
        {
          name: "Remove Department",
          value: "REMOVE_DEPARTMENT"
        },
        {
          name: "Quit",
          value: "QUIT"
        }
      ]
    }
  ]);

  // Call the appropriate function depending on what the user chose
  switch (choice) {
    case "VIEW_EMPLOYEES":
      return viewEmployees();
    case "VIEW_EMPLOYEES_BY_DEPARTMENT":
      return viewEmployeesByDepartment();
    case "VIEW_EMPLOYEE_BY_MANAGER":
      return viewEmployeesByManager();
    case "ADD_EMPLOYEE":
      return addEmployee();
    case "REMOVE_EMPLOYEE":
      return removeEmployee();
    case "UPDATE_EMPLOYEE_ROLE":
      return updateEmployeeRole();
    case "UPDATE_EMPLOYEE_MANAGER":
      return updateEmployeeManager();
    case "VIEW_DEPARTMENTS":
      return viewDepartments();
    case "ADD_DEPARTMENT":
      return addDepartment();
    case "REMOVE_DEPARTMENT":
      return removeDepartment();
    case "VIEW_ROLES":
      return viewRoles();
    case "ADD_ROLE":
      return addRole();
    case "REMOVE_ROLE":
      return removeRole();
    default:
      return quit();
  }
}
//View Employees Function
async function viewEmployees() {
  const employees = await db.findAllEmployees();

  console.log("\n");
  console.table(employees);

  loadMainPrompts();
}
//View Employees By Department
function viewEmployeesByDepartment() {
  inquirer
      .prompt({
          name: "department",
          type: "list",
          message: "Which department would you like to see employees for?",
          choices: ["Fundraising", "Development", "Advising", "Marketing"]
      })
      .then(function (answer) {
          if (answer.department === "Fundraising" || "Development" || "Advising" || "Marketing") {
              connection.query("SELECT employee.id, employee.first_name, employee.last_name, employee.manager_id, roles.title, roles.salary, department.department FROM ((employee INNER JOIN roles ON employee.role_id = roles.id) INNER JOIN department ON roles.department_id = department.id) WHERE department = ?", [answer.department], function (err, result) {
                  if (err) throw err;

                  console.table(result);
                  loadMainPrompts();
              });
          }
      });
}
//View Employees By Manager function
function viewEmployeesByManager() {
  connection.query(db.viewEmployeesByManager(), function (err, results) {
    if (err) throw err;
    console.table(results);
    loadMainPrompts();
  });
}

//Remove employee function
async function removeEmployee() {
  const employees = await db.findAllEmployees();

  const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
    name: `${first_name} ${last_name}`,
    value: id
  }));

  const { employeeId } = await prompt([
    {
      type: "list",
      name: "employeeId",
      message: "Which employee do you want to remove?",
      choices: employeeChoices
    }
  ]);

  await db.removeEmployee(employeeId);

  console.log("Removed employee from the database");

  loadMainPrompts();
}

//Update Employee Roles Function
async function updateEmployeeRole() {
  const employees = await db.findAllEmployees();

  const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
    name: `${first_name} ${last_name}`,
    value: id
  }));

  const { employeeId } = await prompt([
    {
      type: "list",
      name: "employeeId",
      message: "Which employee's role do you want to update?",
      choices: employeeChoices
    }
  ]);

  const roles = await db.viewRoles();

  const roleChoices = roles.map(({ id, title }) => ({
    name: title,
    value: id
  }));

  const { roleId } = await prompt([
    {
      type: "list",
      name: "roleId",
      message: "Which role do you want to assign the selected employee?",
      choices: roleChoices
    }
  ]);

  await db.updateEmployeeRole(employeeId, roleId);

  console.log("Updated employee's role");

  loadMainPrompts();
}

//Create updateEmployeeManager function
function updateEmployeeManager() {
  inquirer.prompt([
    {
      message: "Which employee do you want to update?",
      name: "selectedEmployee",
      type: "list",
      choices: employeeList
    },
    {
      message: "Select their new manager.",
      name: "selectedManager",
      type: "list",
      choices: employeeList
    }
  ]).then(function (answer) {

    var employeeIdToUpdate = (findEmployeeId(answer.selectedEmployee, employeeListObj)) ? findEmployeeId(answer.selectedEmployee, employeeListObj) : null;

    if (answer.selectedManager === answer.selectedEmployee) {
      newManagerId = null;
    } else if (findEmployeeId(answer.selectedManager, employeeListObj)) {
      newManagerId = findEmployeeId(answer.selectedManager, employeeListObj);
    } else {
      newManagerId = null;
    }

    connection.query(sqlqueries.updateEmployeeManager(newManagerId, employeeIdToUpdate), function (err, results) {
      if (err) throw err;
      console.log('The manager for ' + answer.selectedEmployee + ' has been changed to ' + answer.selectedManager + '.');
      init();
    });
  });
}
//Create viewRoles function
async function viewRoles() {
	const viewRoleData = await db.viewRoles();

	console.table(viewRoleData);
}
  
//View Departments function
async function viewDepartments() {
	const viewDepartmentData = await db.viewDepartments();

	console.table(viewDepartmentData);
}

//Create addRole function
async function addRole() {
	const departments = await db.viewDepartments();
	const departmentChoices = departments.map(({ id, name }) => ({
		name: name,
		value: id
	}));
	const role = await prompt([
		{
			name: 'title',
			message: 'What is the name of the role?'
		},
		{
			name: 'salary',
			message: 'What is the salary of the role?'
		},
		{
			type: 'list',
			name: 'department_id',
			message: 'Which department does the role belong to?',
			choices: departmentChoices
		}
	]);
	await db.addRole(role);
  console.log(`Added ${role.title} to the database`);
  loadMainPrompts();
}

//Remove Role Function
async function removeRole() {
  const roles  = await db.viewRoles();

  const roleChoices = roles.map(({ id, name}) => ({
    name: name,
    value: id
  }));

  const { roleID } = await prompt({
    type: "list",
    name: "roleID",
    message:
      "Which role would you like to remove?",
    choices: roleChoices
  });

  await db.removeRole(roleID);

  console.log("Selected Role was removed from the database");
  loadMainPrompts();
}

//Add Department Function
async function addDepartment() {
  const department = await prompt([
    {
      name: "name",
      message: "What department would you like to add?"
    }
  ]);

  await db.addDepartment(department);

  console.log(
    `Added new department (${department.name}) to the database`
  );

  loadMainPrompts();
}


//Remove Department Function
async function removeDepartment() {
  const departments = await db.viewDepartments();

  const departmentChoices = departments.map(({ id, name}) => ({
    name: name,
    value: id
  }));

  const { departmentID } = await prompt({
    type: "list",
    name: "departmentID",
    message:
      "Which department would you like to remove?",
    choices: departmentChoices
  });

  await db.removeDepartment(departmentID);

  console.log("Department was removed from the database");
  loadMainPrompts();
}

//Add Employee Function
async function addEmployee() {
  const roles = await db.viewRoles();
  const employees = await db.viewEmployees();

  const employee = await prompt([
    {
      name: "first_name",
      message: "What is the employee's first name?"
    },
    {
      name: "last_name",
      message: "What is the employee's last name?"
    }
  ]);

  const roleChoices = roles.map(({ id, title }) => ({
    name: title,
    value: id
  }));

  const { roleId } = await prompt({
    type: "list",
    name: "roleId",
    message: "What is the employee's role?",
    choices: roleChoices
  });

  employee.role_id = roleId;

  const managerChoices = employees.map(({ id, first_name, last_name }) => ({
    name: `${first_name} ${last_name}`,
    value: id
  }));
  managerChoices.unshift({ name: "None", value: null });

  const { managerId } = await prompt({
    type: "list",
    name: "managerId",
    message: "Who is the employee's manager?",
    choices: managerChoices
  });

  employee.manager_id = managerId;

  await db.addEmployee(employee);

  console.log(
    `Added ${employee.first_name} ${employee.last_name} to the database`
  );

  loadMainPrompts();
}

function quit() {
  console.log("Goodbye!");
  process.exit();
}
