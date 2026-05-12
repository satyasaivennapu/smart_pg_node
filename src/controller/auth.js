import db from '../middleware/db.config.js';

export async function authenticate(req, res) {
  try {
    const {
      userName,
      password
    } = req.body;

    if (!userName || !password) {
      return res.status(400).json({
        success: false,
        message: "user Name, password are required"
      });
    }

    const [rows] = await db.query(
      'CALL bank.sp_user_login(?,?)',
      [userName, password]
    );

    const user = rows?.[0]?.[0];

    return res.json({
      success: true,
      result: user
    });

  } catch (err) {
    console.error('DB Error:', err);

    /* ---------- SIGNAL error from MySQL ---------- */
    if (err.code === 'ER_SIGNAL_EXCEPTION') {
      return res.status(401).json({
        success: false,
        message: err.message   // USER_NOT_EXISTS / INVALID_PASSWORD / USER_INACTIVE_OR_EXPIRED
      });
    }

    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message
    });
  }
}


export async function users(req, res) {
  try {
    const {
      id = null,
      crudType,
      firstName = null,
      lastName = null,
      surName = null,
      department = null,
      username = null,
      mobileNo = null,
      email = null,
      password = null,
      tenantId = null,
      branchId = null,
      userTypeId = null, // role_id
      isActive = null,
      userId = null     // logged-in user
    } = req.body;

    console.log("users req.body", req.body);

    if (!crudType) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: crudType"
      });
    }

    const params = [
      crudType,     // p_action
      id,           // p_id
      firstName,         // p_name
      lastName,         // p_name
      surName,
      username,         // p_name
      department,         // p_name
      mobileNo,     // p_phone_no
      email,        // p_email
      password,     // p_password (hashed)
      tenantId,     // p_tenant_id
      branchId,     // p_branch_id
      userTypeId,   // p_role_id
      isActive,     // p_is_active
      userId        // p_user_id
    ];

    const [rows] = await db.query(
      'CALL bank.sp_process_user(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      params
    );

    const resultSet = rows?.[0] || [];

    return res.json({
      success: true,
      result: resultSet
    });

  } catch (err) {
    console.error('DB Error:', err);

    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message
    });
  }
}


export async function tenants(req, res) {
  try {
    const {
      id = null,
      crudType,
      name = null,
      code = null,
      email = null,
      mobileNo = null,
      expiryFrom = null,
      expiryTo = null,
      isActive = null,
      userId = null
    } = req.body;

    console.log("tenant req.body", req.body);

    if (!crudType) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: crudType"
      });
    }

    const params = [
      crudType,     // p_action
      id,           // p_id
      name,         // p_name
      code,         // p_code
      email,        // p_email
      mobileNo,     // p_mobile_no
      expiryFrom,   // p_expired_from
      expiryTo,     // p_expired_to
      isActive,     // p_is_active
      userId        // p_user_id
    ];

    const [rows] = await db.query(
      'CALL bank.sp_process_tenant(?,?,?,?,?,?,?,?,?,?)',
      params
    );

    /* ---------- Normalize response ---------- */
    const resultSet = rows?.[0] || [];

    return res.json({
      success: true,
      result: resultSet
    });

  } catch (err) {
    console.error('DB Error:', err);

    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message
    });
  }
}

export async function branch(req, res) {
  try {
    const {
      id = null,
      crudType,
      name = null,
      code = null,
      tenantId = null,
      agreementFrom = null,
      agreementTo = null,
      isActive = null,
      userId = null
    } = req.body;

    console.log("branch req.body", req.body);

    if (!crudType) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: crudType"
      });
    }

    const params = [
      crudType,        // p_action
      id,              // p_id
      name,            // p_name
      code,            // p_code
      tenantId,        // p_tenant_id
      agreementFrom,   // p_agreement_from
      agreementTo,     // p_agreement_to
      isActive,        // p_is_active
      userId           // p_user_id
    ];

    const [rows] = await db.query(
      'CALL bank.sp_process_branch(?,?,?,?,?,?,?,?,?)',
      params
    );

    const resultSet = rows?.[0] || [];

    return res.json({
      success: true,
      result: resultSet
    });

  } catch (err) {
    console.error('DB Error:', err);

    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message
    });
  }
}

export async function processCheckIn(req, res) {
  try {
    //img format branchid + _ + roomdetaild +_ + fileName.jpg
    const {
      tenantId,
      branchId,
      roomId,
      roomsDetailId,
      occupantName,
      occupantPhoneNo,
      occupantProofType,
      occupantProofNo,
      occupantImg,
      occupantProofFrontImg,
      occupantProofBackImg,
      checkInDate,
      depositAmount,
      refundAmount,
      monthlyAmount,
      paymentMode,
      userId,
      refundEligible
    } = req.body;

    console.log("PG Check-in req.body:", req.body);

    /* ---------- Required field validation ---------- */
    if (
      !tenantId ||
      !branchId ||
      !roomId ||
      !roomsDetailId ||
      !occupantName ||
      !occupantPhoneNo ||
      !checkInDate ||
      !monthlyAmount ||
      !userId
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const [rows] = await db.query(
      `CALL bank.sp_pg_checkin(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        tenantId,              // p_tenant_id
        branchId,              // p_branch_id
        roomId,                // p_room_id
        roomsDetailId,         // p_rooms_detail_id
        occupantName,          // p_occupant_name
        occupantPhoneNo,       // p_occupant_contact_no
        occupantProofType,     // p_occupant_proof_type
        occupantProofNo,       // p_occupant_proof_no
        occupantImg,      // p_occupant_proof_img
        occupantProofFrontImg,      // p_occupant_proof_img
        occupantProofBackImg,      // p_occupant_proof_img
        checkInDate,           // p_check_in_date
        depositAmount || 0,    // p_deposit_amount
        refundAmount || 0,     // p_refund_amount
        monthlyAmount,         // p_monthly_amount
        paymentMode || 'CASH', // p_payment_mode
        userId,            // p_created_by
        refundEligible || 0
      ]
    );

    const result = rows?.[0]?.[0] || {};

    return res.json({
      success: true,
      result
    });

  } catch (err) {
    console.error("DB Error:", err);

    /* ---------- SIGNAL handling ---------- */
    if (err.code === 'ER_SIGNAL_EXCEPTION') {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message
    });
  }
}

export async function processPgCheckOut(req, res) {
  try {
    const {
      bookingId,
      checkOutDate,
      userId
    } = req.body;

    console.log("processPgCheckOut req.body:", req.body);

    if (!bookingId || !checkOutDate || !userId) {
      return res.status(400).json({
        success: false,
        message: "bookingId, checkOutDate and userId are required"
      });
    }

    const [rows] = await db.query(
      `CALL bank.sp_pg_vacate(?,?,?)`,
      [
        bookingId,      // p_booking_id
        checkOutDate,   // p_checkout_date
        userId          // p_updated_by
      ]
    );

    const result = rows?.[0]?.[0] || {};

    return res.json({
      success: true,
      result
    });

  } catch (err) {
    console.error("DB Error:", err);

    if (err.code === 'ER_SIGNAL_EXCEPTION') {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message
    });
  }
}

export async function addMonthlyPayment(req, res) {
  try {
    const {
      bookingId,
      monthlyAmount,
      paymentMode,
      userId
    } = req.body;

    console.log("addMonthlyPayment req.body:", req.body);

    if (!bookingId || !monthlyAmount || !userId) {
      return res.status(400).json({
        success: false,
        message: "bookingId, monthlyAmount and userId are required"
      });
    }

    const [rows] = await db.query(
      `CALL bank.sp_pg_add_monthly_payment(?,?,?,?)`,
      [
        bookingId,          // p_booking_id
        monthlyAmount,      // p_monthly_amount
        paymentMode || 'CASH', // p_payment_mode
        userId              // p_created_by
      ]
    );

    const result = rows?.[0]?.[0] || {};

    return res.json({
      success: true,
      result
    });

  } catch (err) {
    console.error("DB Error:", err);

    if (err.code === 'ER_SIGNAL_EXCEPTION') {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message
    });
  }
}

export async function createBranchRooms(req, res) {
  try {
    const {
      tenantId,
      branchId,
      floors,           // JSON array
      bedAvailability,
      userId
    } = req.body;

    console.log("createBranchRooms req.body:", req.body);

    if (!tenantId || !branchId || !floors || !userId) {
      return res.status(400).json({
        success: false,
        message: "tenantId, branchId, floors and userId are required"
      });
    }

    const [rows] = await db.query(
      `CALL bank.sp_create_branch_rooms(?,?,?,?,?)`,
      [
        tenantId,                     // p_tenant_id
        branchId,                     // p_branch_id
        JSON.stringify(floors),       // p_floors_json
        bedAvailability || 1,         // p_bed_availability
        userId                        // p_user_id
      ]
    );

    const result = rows?.[0]?.[0] || {};

    return res.json({
      success: true,
      result
    });

  } catch (err) {
    console.error("DB Error:", err);

    if (err.code === 'ER_SIGNAL_EXCEPTION') {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message
    });
  }
}

export async function getPaymentReceipt(req, res) {
  try {
    const { invoice_number } = req.body;

    if (!invoice_number) {
      return res.status(400).json({
        success: false,
        message: "invoice_number is required"
      });
    }

    const [rows] = await db.query(
      `CALL bank.sp_pg_payment_receipt(?)`,
      [invoice_number]
    );

    const result = rows?.[0]?.[0] || null;

    return res.json({
      success: true,
      result
    });

  } catch (err) {
    console.error("DB Error:", err);

    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message
    });
  }
}
export async function getCheckoutReport(req, res) {
  try {
    const {
      tenantId,
      branchId,
      fromDate,
      toDate
    } = req.body;

    if (!tenantId || !branchId || !fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "tenantId, branchId, fromDate and toDate are required"
      });
    }

    const [rows] = await db.query(
      `CALL bank.sp_pg_checkout_report(?,?,?,?)`,
      [
        tenantId,
        branchId,
        fromDate,
        toDate
      ]
    );

    const result = rows?.[0] || [];

    return res.json({
      success: true,
      result
    });

  } catch (err) {
    console.error("DB Error:", err);

    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message
    });
  }
}
export async function getCheckinReport(req, res) {
  try {
    const {
      tenantId,
      branchId,
      fromDate,
      toDate
    } = req.body;

    if (!tenantId || !branchId || !fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "tenantId, branchId, fromDate and toDate are required"
      });
    }

    const [rows] = await db.query(
      `CALL bank.sp_pg_checkin_report(?,?,?,?)`,
      [
        tenantId,
        branchId,
        fromDate,
        toDate
      ]
    );

    const result = rows?.[0] || [];

    return res.json({
      success: true,
      result
    });

  } catch (err) {
    console.error("DB Error:", err);

    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message
    });
  }
}
export async function getPaymentHistory(req, res) {
  try {
    const {
      tenantId,
      branchId,
      bookingId = null
    } = req.body;

    if (!tenantId || !branchId) {
      return res.status(400).json({
        success: false,
        message: "tenantId and branchId are required"
      });
    }

    const [rows] = await db.query(
      `CALL bank.sp_pg_payment_history(?,?,?)`,
      [
        tenantId,
        branchId,
        bookingId
      ]
    );

    const result = rows?.[0] || [];

    return res.json({
      success: true,
      result
    });

  } catch (err) {
    console.error("DB Error:", err);

    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message
    });
  }
}

export async function getBranchFloors(req, res) {
  try {
    const {
      branchId,
      userId
    } = req.body;

    console.log("sp_get_floors_by_branch req.body:", req.body);

    if (!branchId || !userId) {
      return res.status(400).json({
        success: false,
        message: "branchId and userId are required"
      });
    }

    const [rows] = await db.query(
      `CALL bank.sp_get_floors_by_branch(?,?)`,
      [
        branchId,      // p_booking_id
        userId          // p_updated_by
      ]
    );

    const result = rows?.[0] || {};

    return res.json({
      success: true,
      result
    });

  } catch (err) {
    console.error("DB Error:", err);

    if (err.code === 'ER_SIGNAL_EXCEPTION') {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message
    });
  }
}
export async function getBranchRoomTypes(req, res) {
  try {
    const {
      branchId,
      floorNo,
      userId
    } = req.body;

    console.log("sp_get_floors_by_branch req.body:", req.body);

    if (!branchId || !userId) {
      return res.status(400).json({
        success: false,
        message: "branchId and userId are required"
      });
    }

    const [rows] = await db.query(
      `CALL bank.sp_get_room_types_by_branch(?,?,?)`,
      [
        branchId,      // p_booking_id
        floorNo,
        userId          // p_updated_by
      ]
    );

    const result = rows?.[0] || {};

    return res.json({
      success: true,
      result
    });

  } catch (err) {
    console.error("DB Error:", err);

    if (err.code === 'ER_SIGNAL_EXCEPTION') {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message
    });
  }
}
export async function getBranchRoomCapacity(req, res) {
  try {
    const {
      branchId,
      floorNo,
      userId
    } = req.body;

    console.log("sp_get_room_capacity_by_branch req.body:", req.body);

    if (!branchId || !userId) {
      return res.status(400).json({
        success: false,
        message: "branchId and userId are required"
      });
    }

    const [rows] = await db.query(
      `CALL bank.sp_get_room_capacity_by_branch(?,?,?)`,
      [
        branchId,      // p_booking_id
        floorNo,
        userId          // p_updated_by
      ]
    );

    const result = rows?.[0] || {};

    return res.json({
      success: true,
      result
    });

  } catch (err) {
    console.error("DB Error:", err);

    if (err.code === 'ER_SIGNAL_EXCEPTION') {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message
    });
  }
}
export async function getAvailbleBeds(req, res) {
  try {
    const {
      branchId,
      roomId,
      userId
    } = req.body;

    console.log("sp_get_available_beds_by_room_id req.body:", req.body);

    if (!branchId || !roomId || !userId) {
      return res.status(400).json({
        success: false,
        message: "branchId,roomId  and userId are required"
      });
    }

    const [rows] = await db.query(
      `CALL bank.sp_get_available_beds_by_room_id(?,?,?)`,
      [
        branchId,      // p_booking_id
        roomId,
        userId         // p_updated_by
      ]
    );

    const result = rows?.[0] || {};

    return res.json({
      success: true,
      result
    });

  } catch (err) {
    console.error("DB Error:", err);

    if (err.code === 'ER_SIGNAL_EXCEPTION') {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message
    });
  }
}
export async function getAvailbleRooms(req, res) {
  try {
    const {
      branchId,
      floorNo,
      roomType,
      roomCapacity,
      userId
    } = req.body;

    console.log("sp_get_room_no req.body:", req.body);

    if (!branchId || !floorNo || !roomType || !roomCapacity || !userId) {
      return res.status(400).json({
        success: false,
        message: "branchId,floorNo,roomType ,roomCapacity and userId are required"
      });
    }

    const [rows] = await db.query(
      `CALL bank.sp_get_room_no(?,?,?,?,?)`,
      [
        branchId,      // p_booking_id
        floorNo,
        roomType,
        roomCapacity,
        userId         // p_updated_by
      ]
    );

    const result = rows?.[0] || {};

    return res.json({
      success: true,
      result
    });

  } catch (err) {
    console.error("DB Error:", err);

    if (err.code === 'ER_SIGNAL_EXCEPTION') {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message
    });
  }
}
export async function getDashboard(req, res) {
  try {
    const { tenantId, branchId } = req.body;

    if (!tenantId || !branchId) {
      return res.status(400).json({
        success: false,
        message: "tenantId and branchId are required"
      });
    }
    console.log("sp_pg_dashboard_totals req.body:", req.body);

    const [rows] = await db.query(
      `CALL bank.sp_pg_dashboard_totals(?, ?)`,
      [tenantId, branchId]
    );

    /*
      rows[0][0] → room summary
      rows[1][0] → finance summary
    */

    const roomSummary = rows?.[0] || {};
    const roomsInfo = rows?.[1] || {};
    const financeSummary = rows?.[2]?.[0] || {};
    const expenseSummary = rows?.[3]?.[0] || {};
    const paidToday = Number(financeSummary.paid_today || 0);
    const expectedToday = Number(financeSummary.expected_today || 0);
    const paidDueToday = Number(financeSummary.paid_due_today || 0);
    const depositAmountToday = Number(financeSummary.deposit_amount || 0);
    const refundAmountToday = Number(financeSummary.refund_amount || 0);

    const pendingToday = Math.max(expectedToday - paidDueToday, 0);
    const todayExpenses = Number(expenseSummary.today_expenses || 0);
    return res.json({
      success: true,
      dashboard: {
        rooms: roomSummary,
        roomsInfo: roomsInfo,
        finance: {
          paid_today: paidToday,
          expected_today: expectedToday,
          paid_due_today: paidDueToday,
          pending_today: pendingToday,
          deposit_amount_today: depositAmountToday,
          refund_amount_today: refundAmountToday,
          today_expenses: todayExpenses
        }
      }
    });

  } catch (err) {
    console.error("DB Error:", err);

    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message
    });
  }
}

export async function getOccupantDues(req, res) {
  try {
    const {
      tenantId,
      branchId
    } = req.body;

    console.log("sp_pg_user_pending_today req.body:", req.body);

    if (!branchId || !tenantId) {
      return res.status(400).json({
        success: false,
        message: "branchId and tenantId are required"
      });
    }

    const [rows] = await db.query(
      `CALL bank.sp_pg_user_pending_today(?,?)`,
      [
        tenantId,
        branchId       // p_updated_by
      ]
    );

    const result = rows?.[0] || {};

    return res.json({
      success: true,
      result
    });

  } catch (err) {
    console.error("DB Error:", err);

    if (err.code === 'ER_SIGNAL_EXCEPTION') {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message
    });
  }
}
export async function getNextSevenDaysDues(req, res) {
  try {
    const {
      tenantId,
      branchId
    } = req.body;

    console.log("sp_pg_next_7_days_pending req.body:", req.body);

    if (!branchId || !tenantId) {
      return res.status(400).json({
        success: false,
        message: "branchId and tenantId are required"
      });
    }

    const [rows] = await db.query(
      `CALL bank.sp_pg_next_7_days_pending(?,?)`,
      [
        tenantId,
        branchId       // p_updated_by
      ]
    );

    const result = rows?.[0] || {};

    return res.json({
      success: true,
      result
    });

  } catch (err) {
    console.error("DB Error:", err);

    if (err.code === 'ER_SIGNAL_EXCEPTION') {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message
    });
  }
}

export async function getUserRoles(req, res) {
  try {

    console.log("sp_get_user_roles req.body:", req.body);

    const [rows] = await db.query(
      `CALL bank.sp_get_user_roles()`
    );

    const result = rows?.[0] || {};

    return res.json({
      success: true,
      result
    });

  } catch (err) {
    console.error("DB Error:", err);

    if (err.code === 'ER_SIGNAL_EXCEPTION') {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message
    });
  }
}


export async function manageExpenses(req, res) {

  console.log("manageExpenses API called");

  try {

    const {
      action,
      id,
      name,
      description,
      branch_id,
      amount,
      paid_date
    } = req.body;

    const userId = req.user?.id || req.body.user_id;

    if (!action) {
      return res.status(400).json({
        success: false,
        message: "Action is required"
      });
    }

    const params = [
      action,
      id || null,
      name || null,
      description || null,
      branch_id || null,
      amount || null,
      paid_date || null,
      userId || null
    ];

    console.log("Request body:", req.body);

    const [rows] = await db.query(
      `CALL sp_manage_expenses(?,?,?,?,?,?,?,?)`,
      params
    );

    console.log("Stored Procedure Result:", rows);

    const result = rows?.[0] || [];

    return res.json({
      success: true,
      result
    });

  } catch (err) {

    console.error("DB Error:", err);

    if (err.code === 'ER_SIGNAL_EXCEPTION') {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message
    });

  }
};
export async function manageCollections(req, res) {

  console.log("manageQrCollectionPayload API called");

  try {

    const {
      action,
      id,
      branch_name,
      branch_code,
      loan_type,
      borrower_name,
      area_name,
      transaction_number,
      amount,
      payment_type,
      remarks,
    } = req.body;

    const userId = req.user?.id || req.body.user_id;

    if (!action) {
      return res.status(400).json({
        success: false,
        message: "Action is required"
      });
    }

    const params = [
      action,
      id || null,
      branch_name || null,
      branch_code || null,
      loan_type || null,
      borrower_name || null,
      area_name || null,
      transaction_number || null,
      amount || null,
      payment_type || null,
      remarks || null,
      userId || null
    ];

    console.log("Request body:", req.body);

    const [rows] = await db.query(
      `CALL sp_process_collections(?,?,?,?,?,?,?,?,?,?,?,?)`,
      params
    );

    console.log("Stored Procedure Result:", rows);

    const result = rows?.[0] || [];

    return res.json({
      success: true,
      result
    });

  } catch (err) {

    console.error("DB Error:", err);

    if (err.code === 'ER_SIGNAL_EXCEPTION') {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message
    });

  }
}
