
const rows = [
    "ServiceName",
    "ServiceID",
    "PublisherURL",
    "Publisher",
    "Comment",
    "Table",
    "Application",
    "Data",
];

document.addEventListener("DOMContentLoaded", function () {
    // 使用XMLHttpRequest来进行POST请求
    var xhr = new XMLHttpRequest();
    // xhr.open('POST', '/get_services', true);
    xhr.open("GET", "/get_services", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    // 当接收到响应时的操作
    xhr.onload = function () {
        if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            populateTable(response.services);
        } else {
            console.error("Server error:", xhr.status);
        }
    };

    xhr.onerror = function () {
        console.error("Request failed", xhr.status);
    };

    xhr.send();
});

function approveOnClick(row) {
    // 获取当前行的所有单元格
    const cells = row.cells;

    // 构造一个对象,包含当前行的所有数据
    const rowData = {
        ServiceName: cells[rows.indexOf("ServiceName")].textContent,
        ServiceID: cells[rows.indexOf("ServiceID")].textContent,
        PublisherURL: cells[rows.indexOf("PublisherURL")].textContent,
        Publisher: cells[rows.indexOf("Publisher")].textContent,
        Comment: cells[rows.indexOf("Comment")].textContent,
        Table: cells[rows.indexOf("Table")].textContent,
    };

    // 发送 POST 请求到 /forward_application 接口
    fetch("/forward_application", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(rowData),
    })
        .then((response) => {
            if (response.ok) {
                console.log("Forward Application successfully");
            } else {
                console.error("Failed to approve application");
            }
        })
        .then((data) => console.log(data))
        .catch((error) => console.error("error:", error));
}

function dataOnClick(service) {
    // fetch_data
    const data = {
        ServiceID: service.ServiceID,
        PublisherURL: service.PublisherURL
    }
    fetch("/fetch_data", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
    .then((response) => {
        response.json().then((data) => {
            if (!response.ok) {
                alert(data.error);
            } else {
                console.log(data.data);
                parsedData = JSON.parse(data.data);
                displayDataModal(parsedData);
            }
        });
    })
}

// ServiceName, ServiceID, PublisherURL, Publisher, Comment, Table, Approved, NoAccess
function addServiceRow(service, tableBody) {
    const row = tableBody.insertRow();
    console.log("addServiceRow:", service)

    row.insertCell(rows.indexOf("ServiceName")).textContent = service.ServiceName;
    row.insertCell(rows.indexOf("ServiceID")).textContent = service.ServiceID;
    row.insertCell(rows.indexOf("PublisherURL")).textContent = service.PublisherURL;
    row.insertCell(rows.indexOf("Publisher")).textContent = service.Publisher;
    row.insertCell(rows.indexOf("Comment")).textContent = service.Comment;
    row.insertCell(rows.indexOf("Table")).textContent = service.Table ? service.Table : "数据库未配置";

    // 添加approve按钮
    const approveBtn = document.createElement("button");
    approveBtn.className = "button-style";
    approveBtn.textContent = "Apply";
    approveBtn.setAttribute("data-service-id", service.ServiceID);
    approveBtn.onclick = () => approveOnClick(row);
    row.insertCell(rows.indexOf("Application")).appendChild(approveBtn);

    // 切换 approve button
    if (service.Approved) {
        approveBtn.textContent = "Approved";
        approveBtn.disabled = true;
        approveBtn.classList.remove("button-style");
        approveBtn.classList.add("button-disabled");
    }

    // View button
    const viewBtn = document.createElement("button");
    viewBtn.textContent = "View";
    viewBtn.className = "button-style";
    viewBtn.onclick = () => dataOnClick(service);
    row.insertCell(rows.indexOf("data")).appendChild(viewBtn);

    // 切换 view 权限
    if (service.NoAccess) {
        viewBtn.textContent = "No Access";
        viewBtn.disabled = true;
        viewBtn.classList.remove("button-style");
        viewBtn.classList.add("button-disabled");
    }
}

function createTable(data) {
    const table = document.createElement("table");
    table.className = "data-table"; // Apply CSS styling as needed
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    console.log("datatype:", typeof (data))

    // 创建表头
    const headerRow = document.createElement("tr");
    for (const key in data[0]) {
        const th = document.createElement("th");
        th.textContent = key;
        headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);

    // 创建表格内容
    for (const item of data) {
        const row = document.createElement("tr");
        for (const key in item) {
            const td = document.createElement("td");
            td.textContent = item[key];
            row.appendChild(td);
        }
        tbody.appendChild(row);
    }

    table.appendChild(thead);
    table.appendChild(tbody);

    return table;
}

function displayDataModal(resdata) {
    const modal = document.createElement("div");
    modal.className = "modal";

    modal.onclick = function (event) {
        if (event.target === modal) {
            document.body.removeChild(modal); // 从DOM中移除整个遮罩层和模态窗口
        }
    };

    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";
    modal.appendChild(modalContent);

    const closeBtn = document.createElement("span");
    closeBtn.className = "close";
    closeBtn.innerHTML = "&times;";
    closeBtn.onclick = function () {
        modal.style.display = "none";
        document.body.removeChild(modal);
    };
    modalContent.appendChild(closeBtn);

    table = createTable(resdata);

    modalContent.appendChild(table);
    document.body.appendChild(modal);
    modal.style.display = "block";
}

function populateTable(services) {
    const tableBody = document
        .getElementById("servicesTable")
        .getElementsByTagName("tbody")[0];

    services.forEach((service) => {
        addServiceRow(service, tableBody);
    });
}

function appendNewServiceRow(newService) {
    const tableBody = document
        .getElementById("servicesTable")
        .getElementsByTagName("tbody")[0];

    addServiceRow(newService, tableBody);
}

// function approveService(serviceID, buyerID, headers, expiretime, button) {
//   // 示例加密TOKEN
//   const encryptedToken = "sampleEncryptedToken";

//   // 构建POST请求的数据
//   const postData = {
//     applicationID: serviceID, // 此处假设serviceID即为applicationID
//     buyerID: buyerID,
//     headers: headers,
//     expiretime: expiretime,
//     approval: true,
//   };

//   // 发送POST请求
//   fetch("/approve_application", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(postData),
//   })
//     .then((response) => {
//       if (response.status === 200) {
//         return response.json();
//       } else {
//         alert("Approval failed with status: " + response.status);
//       }
//     })
//     .then(() => {
//       alert("Approval successful!");

//       // 更新按钮文本或移除按钮
//       button.textContent = "Approved"; // 更改按钮文本
//       button.disabled = true; // 禁用按钮
//       button.classList.remove("button-style");
//       button.classList.add("button-disabled");
//     })
//     .catch((error) => {
//       console.error("Error:", error);
//       alert("Approval process encountered an error.");
//     });
// }

// function approve(serviceID) {
//   const buyerID = "someBuyerID";
//   const headers = ["Header1", "Header2"];
//   const expiretime = new Date().toISOString();

//   // 获取当前的approve按钮
//   const approveBtn = document.querySelector(
//     `button[data-service-id="${serviceID}"]`,
//   );

//   // 调用approveService时，传入当前的按钮
//   approveService(serviceID, buyerID, headers, expiretime, approveBtn);

//   console.log(`Approved service with ID: ${serviceID}`);
// }

function displayServices(services) {
    var serviceList = document.getElementById("serviceList");
    services.forEach(function (service) {
        var li = document.createElement("li");
        li.textContent = service;
        serviceList.appendChild(li);
    });
}

const addServiceBtn = document.getElementById("addServiceBtn");
const addServiceModal = document.getElementById("addServiceModal");
const closeBtn = document.querySelector(".close-btn");

addServiceBtn.addEventListener("click", () => {
    addServiceModal.style.display = "block";
});

closeBtn.addEventListener("click", () => {
    addServiceModal.style.display = "none";
});

window.addEventListener("click", (event) => {
    if (event.target == addServiceModal) {
        addServiceModal.style.display = "none";
    }
});

// 获取表单元素
const addServiceForm = document.getElementById("addServiceForm");

// 为表单添加事件监听器
addServiceForm.addEventListener("submit", async function (event) {
    // 阻止表单的默认提交行为
    event.preventDefault();

    // 获取表单中的各个字段的值
    const serviceName = event.target.elements.serviceName.value;
    const comment = event.target.elements.comment.value;

    // 创建请求正文
    const requestData = {
        serviceName: serviceName,
        comment: comment,
    };
    console.log(requestData);

    try {
        // 向put_service端点发送POST请求
        const response = await fetch("/put_service", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
        });

        const result = await response.json();
        console.log(result);
        if (response.status === 200) {
            alert(
                "Service added successfully. Transaction hash: " +
                result.Table,
            );
            requestData.approved = false;
            requestData.Table = result.Table ? result.Table : "数据库未配置";
            requestData.serviceID = result.serviceID;
            appendNewServiceRow(requestData);
        } else {
            alert("Failed to add service.");
        }
    } catch (error) {
        alert("Error occurred: " + error.message);
    }

    // 最后，关闭模态框
    addServiceModal.style.display = "none";
});

// Assuming your modal has an overlay with the ID 'modal-overlay'
// var modalOverlay = document.getElementById("modal-overlay");
// var dataModal = document.getElementById("data-modal"); // The ID of your "View Data" modal

// modalOverlay.addEventListener("click", function (event) {
//   if (event.target == modalOverlay) {
//     dataModal.style.display = "none";
//   }
// });
