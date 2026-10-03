import { useEffect, useState } from "react";
import * as Notifications from "expo-notifications";
import * as Calendar from "expo-calendar";
import { Platform, Alert } from "react-native";

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function useFlightReminders() {
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    // Request notification permissions
    const { status: notifStatus } =
      await Notifications.requestPermissionsAsync();

    // Request calendar permissions
    const { status: calendarStatus } =
      await Calendar.requestCalendarPermissionsAsync();

    setPermissionsGranted(
      notifStatus === "granted" && calendarStatus === "granted",
    );
  };

  const scheduleFlightReminder = async (document, flightTime) => {
    try {
      if (!permissionsGranted) {
        Alert.alert(
          "Permissions Required",
          "Please enable notifications and calendar access",
        );
        await requestPermissions();
        return;
      }

      const flightDate = new Date(flightTime);
      const now = new Date();

      // Schedule notification 24 hours before
      const notificationTime = new Date(
        flightDate.getTime() - 24 * 60 * 60 * 1000,
      );

      if (notificationTime > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "✈️ Flight Check-in Reminder",
            body: `Your flight "${document.title}" is in 24 hours! Don't forget to check in.`,
            data: { documentId: document.id, type: "flight_reminder" },
            sound: true,
          },
          trigger: notificationTime,
        });

        // Schedule second notification 3 hours before
        const secondNotificationTime = new Date(
          flightDate.getTime() - 3 * 60 * 60 * 1000,
        );

        if (secondNotificationTime > now) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "🛫 Flight Departure Soon",
              body: `Your flight "${document.title}" departs in 3 hours!`,
              data: { documentId: document.id, type: "flight_departure" },
              sound: true,
            },
            trigger: secondNotificationTime,
          });
        }
      }

      // Add to calendar
      await addToCalendar(document, flightTime);

      // Update backend
      await fetch("/api/notifications/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_id: document.id,
          flight_time: flightTime,
          check_in_time: new Date(
            flightDate.getTime() - 24 * 60 * 60 * 1000,
          ).toISOString(),
        }),
      });

      Alert.alert(
        "Reminders Set!",
        "You'll get notifications 24 hours and 3 hours before your flight. Event added to calendar!",
      );
    } catch (error) {
      console.error("Error scheduling reminders:", error);
      Alert.alert("Error", "Could not schedule reminders");
    }
  };

  const addToCalendar = async (document, flightTime) => {
    try {
      // Get default calendar
      const calendars = await Calendar.getCalendarsAsync(
        Calendar.EntityTypes.EVENT,
      );
      const defaultCalendar =
        calendars.find((cal) => cal.isPrimary) || calendars[0];

      if (!defaultCalendar) {
        console.log("No calendar found");
        return;
      }

      const startDate = new Date(flightTime);
      const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000); // 3 hours duration

      await Calendar.createEventAsync(defaultCalendar.id, {
        title: `✈️ ${document.title}`,
        startDate,
        endDate,
        notes: "Flight - Check in 24 hours before departure",
        alarms: [
          { relativeOffset: -24 * 60 }, // 24 hours before
          { relativeOffset: -3 * 60 }, // 3 hours before
        ],
      });

      console.log("Added to calendar successfully");
    } catch (error) {
      console.error("Error adding to calendar:", error);
    }
  };

  const cancelFlightReminder = async (documentId) => {
    try {
      // Cancel all scheduled notifications for this document
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();

      for (const notif of scheduled) {
        if (notif.content.data?.documentId === documentId) {
          await Notifications.cancelScheduledNotificationAsync(
            notif.identifier,
          );
        }
      }
    } catch (error) {
      console.error("Error canceling reminders:", error);
    }
  };

  return {
    scheduleFlightReminder,
    cancelFlightReminder,
    permissionsGranted,
  };
}
