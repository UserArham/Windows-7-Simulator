import tkinter as tk
from time import strftime

def create_window():
    # Placeholder function to simulate opening an application
    app_window = tk.Toplevel(root)
    app_window.title("App")
    app_window.geometry("200x100")
    tk.Label(app_window, text="Windows 7 App").pack(pady=20)

# Setup Main Desktop Environment
root = tk.Tk()
root.title("Windows 7 Simulator")
root.geometry("800x600")
root.configure(bg="#3C5A7A") # Classic Windows 7 blue-ish background

# Taskbar
taskbar = tk.Frame(root, bg="#2C3E50", height=40)
taskbar.pack(side="bottom", fill="x")

# Start Button
start_button = tk.Button(taskbar, text="Start", bg="#2980b9", fg="white", 
                         font=("Segoe UI", 10, "bold"), command=create_window)
start_button.pack(side="left", padx=5, pady=5)

# Clock
def update_time():
    time_str = strftime('%H:%M %p')
    clock_label.config(text=time_str)
    clock_label.after(1000, update_time)

clock_label = tk.Label(taskbar, bg="#2C3E50", fg="white", font=("Segoe UI", 10))
clock_label.pack(side="right", padx=10)
update_time()

root.mainloop()
