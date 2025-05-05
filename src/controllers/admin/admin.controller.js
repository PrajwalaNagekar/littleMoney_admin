import allDetailsModel from "../../models/allDetails.model.js";
import axios from "axios";
import offerSchema from '../../models/offers.model.js'
import offerSummaryModal from "../../models/offerSummary.modal.js";

export const getAllDetails = async (req, res) => {
  try {
    const details = await allDetailsModel.find()
      .populate('personalLoanRef')  // Populating personal loan details
      .populate('businessLoanRef')  // Populating business loan details
      .populate('appliedCustomerRef')  // Populating applied customer details
      .populate('registerRef')  // Populating register details
      .populate('loginCountRef')  // Populating login count details
      .exec();
    console.log("🚀 ~ getAllDetails ~ details:", details)

    if (!details) {
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