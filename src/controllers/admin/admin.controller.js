import allDetailsModel from "../../models/allDetails.model.js";
import axios from "axios";
import offerSchema from '../../models/offers.model.js'
import offerSummaryModal from "../../models/offerSummary.modal.js";

export const getAllDetails = async (req, res) => {
  try {
    const { search = '' } = req.query;

    // Prepare RegExp for case-insensitive partial match
    const searchRegex = new RegExp(search, 'i');

    // Step 1: Get all details with population
    let details = await allDetailsModel.find()
      .populate('personalLoanRef')
      .populate('businessLoanRef')
      .populate('appliedCustomerRef')
      .populate('registerRef')
      .populate('loginCountRef')
      .exec();

    // Step 2: Filter in-memory after population (since you can't query nested populated fields directly)
    if (search) {
      details = details.filter((item) => {
        const leadIdMatch = item.leadId?.toLowerCase().includes(search.toLowerCase());
        const mobileMatch = item.mobileNumber?.toLowerCase().includes(search.toLowerCase());

        const personalFirst = item.personalLoanRef?.firstName?.toLowerCase().includes(search.toLowerCase());
        const personalLast = item.personalLoanRef?.lastName?.toLowerCase().includes(search.toLowerCase());

        const businessFirst = item.businessLoanRef?.firstName?.toLowerCase().includes(search.toLowerCase());
        const businessLast = item.businessLoanRef?.lastName?.toLowerCase().includes(search.toLowerCase());

        return (
          leadIdMatch ||
          mobileMatch ||
          personalFirst ||
          personalLast ||
          businessFirst ||
          businessLast
        );
      });
    }

    if (!details || details.length === 0) {
      return res.status(404).json({ success: false, message: 'No details found' });
    }

    res.status(200).json({
      success: true,
      data: details,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOffersApi = async (req, res) => {
  const { leadId } = req.params;
  try {
    const axiosInstance = axios.create({
      baseURL: process.env.API_BASE_URL,
      headers: {
        'apikey': process.env.API_KEY,
        'Content-Type': 'application/json',
      },
    });
    const response = await axiosInstance.get(`/partner/get-offers/${leadId}`);
    // console.log("reasponse",response.data);
    // res.status(200).json(response.data);
    const data = response.data;
    if (data.success === "true" && Array.isArray(data.offers) && data.offers.length > 0) {
      // Replace existing document for that leadId
      await offerSchema.findOneAndUpdate(
        { leadId },
        { leadId, offers: data.offers },
        { upsert: true, new: true }
      );
      // await appliedCustomersModal.findByIdAndUpdate(
      //   {leadId},
      //   {lenderName}
      // )
    }

    res.status(200).json(data);

  } catch (error) {
    console.error('Error fetching offers:', error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to fetch offers',
    });
  }
};

export const getSummaryApi = async (req, res) => {
  const { leadId } = req.params;
  // console.log("req params",req.params);

  try {
    const axiosInstance = axios.create({
      baseURL: process.env.API_BASE_URL,
      headers: {
        'apikey': process.env.API_KEY,
        'Content-Type': 'application/json',
      },
    });

    const response = await axiosInstance.get(`/partner/get-summary/${leadId}`);
    const summaryData = response.data;
    // console.log(summaryData);


    if (summaryData.success) {
      const {
        offersTotal,
        maxLoanAmount,
        minMPR,
        maxMPR,
      } = summaryData.summary;
      const redirectionUrl = summaryData.redirectionUrl;

      // Save to DB (create or update if already exists)
      const saved = await offerSummaryModal.findOneAndUpdate(
        { leadId }, // find by leadId
        { leadId, offersTotal, maxLoanAmount, minMPR, maxMPR, redirectionUrl }, // update fields
        { upsert: true, new: true } // create if not exists
      );

      res.status(200).json(summaryData);
    } else {
      res.status(400).json({ success: false, message: 'API did not return success' });
    }

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch and save summary' });
  }
}

//fliter based on created at and updated at(pl and bl)
export const getFilteredData = async (req, res) => {
  try {
    const { from, to, type = 'created' } = req.query;

    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;

    if (toDate) {
      toDate.setHours(23, 59, 59, 999); // Extend to end of day
    }

    const dateField = type === 'updated' ? 'updatedAt' : 'createdAt';

    console.log('📅 Date Filter:', { fromDate, toDate, type });

    const pipeline = [
      {
        $lookup: {
          from: 'personalloans',
          localField: 'personalLoanRef',
          foreignField: '_id',
          as: 'personalLoan',
        },
      },
      { $unwind: '$personalLoan' },
      {
        $lookup: {
          from: 'businessloans',
          localField: 'businessLoanRef',
          foreignField: '_id',
          as: 'businessLoan',
        },
      },
      { $unwind: '$businessLoan' },
    ];

    if (fromDate && toDate) {
      pipeline.push({
        $match: {
          $or: [
            { [`personalLoan.${dateField}`]: { $gte: fromDate, $lte: toDate } },
            { [`businessLoan.${dateField}`]: { $gte: fromDate, $lte: toDate } },
          ],
        },
      });
    }

    const result = await allDetailsModel.aggregate(pipeline);
    console.log('✅ Aggregated Records:', result.length);

    if (!result || result.length === 0) {
      return res.status(404).json({ success: false, message: 'No details found' });
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


