exports.createTracker = async (templateData, rowDataArray) => {
  const { user_id, manager_card_id, shift, date, hours, additional_appointment } = templateData;

  // First, create tracker header
  const [trackerResult] = await db.query(
    `INSERT INTO trackers
     (user_id, manager_card_id, shift, date, hours, additional_appointment)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      user_id,
      manager_card_id || null,
      shift || null,
      date || null,
      hours || 0,
      JSON.stringify(additional_appointment || [])
    ]
  );

  const trackerId = trackerResult.insertId;

  // Then, insert rows for this tracker
  if (rowDataArray && rowDataArray.length > 0) {
    const inserts = rowDataArray.map(row => [
      trackerId,
      row.phone_number || null,
      row.no_answer || 0,
      row.voicemail || 0,
      row.not_in_service || 0,
      row.left_message || 0,
      row.call_backs || 0,
      row.appointments || 0,
      row.preset_appointments || 0,
      row.confirmed_presets || 0,
      row.state || null,
      row.status || null,
      row.comment || null
    ]);

    await db.query(
      `INSERT INTO tracker_rows
       (tracker_id, phone_number, no_answer, voicemail, not_in_service, left_message,
        call_backs, appointments, preset_appointments, confirmed_presets, state, status, comment)
       VALUES ?`,
      [inserts]
    );
  }

  return { success: true, trackerId };
};
