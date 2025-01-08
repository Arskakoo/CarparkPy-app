import React, { useEffect, useState } from "react";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/notifications")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }
        return response.json();
      })
      .then((data) => {
        setNotifications(data[0]?.Notifications || []);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-5">
      <p className="text-orange-400 font-bold text-xl border-b pb-10">
        Tietotteet
      </p>
      <div>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div key={notification.id} className=" p-4 border-b">
              <p className="text-lg font-bold text-blue-400">
                {notification.name}
              </p>
              <p className="text-sm text-slate-500">{notification.text}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-slate-400 py-20 ">
            No notifications available.
          </p>
        )}
      </div>
    </div>
  );
};

export default Notification;
