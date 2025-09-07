// Initialize charts
document.addEventListener("DOMContentLoaded", function () {
  // Admissions Chart
  const admissionsCtx = document
    .getElementById("admissionsChart")
    .getContext("2d");
  new Chart(admissionsCtx, {
    type: "bar",
    data: {
      labels: [
        "Jan","Feb","Mar","Apr","May","Jun",
        "Jul","Aug","Sep","Oct","Nov","Dec"
      ],
      datasets: [
        {
          label: "New Admissions",
          data: [45, 60, 75, 82, 95, 105, 120, 115, 100, 90, 70, 55],
          backgroundColor: "rgba(67, 97, 238, 0.5)",
          borderColor: "rgba(67, 97, 238, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true },
      },
    },
  });

  // Fee Collection Chart
  const feeCtx = document.getElementById("feeChart").getContext("2d");
  new Chart(feeCtx, {
    type: "doughnut",
    data: {
      labels: ["Tuition Fee", "Hostel Fee", "Exam Fee", "Library Fee", "Other"],
      datasets: [
        {
          data: [65, 20, 8, 5, 2],
          backgroundColor: [
            "rgba(67, 97, 238, 0.7)",
            "rgba(76, 201, 240, 0.7)",
            "rgba(247, 37, 133, 0.7)",
            "rgba(72, 149, 239, 0.7)",
            "rgba(230, 57, 70, 0.7)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
      },
    },
  });

  // Add interactivity to menu items
  const menuItems = document.querySelectorAll(".menu li");
  menuItems.forEach((item) => {
    item.addEventListener("click", function () {
      menuItems.forEach((i) => i.classList.remove("active"));
      this.classList.add("active");
    });
  });
});
