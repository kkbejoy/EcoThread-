const { model } = require('mongoose');
const orderSchema = require('../model/orderModel');
const categorySchema = require('../model/categoryModel');
const productSchema = require('../model/productModel');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;


//Total Revenue per month
const totalRevenue = async () => {
  try {
    const totalRevenue = await orderSchema.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y',
              date: '$dateCreated',
            },
          },
          totalPrice: { $sum: '$totalPrice' },
        },
      },
    ]);
    console.log('Total revenue', totalRevenue);
    return totalRevenue;
  } catch (error) {
    console.log(error);
    resolve.render('error');
  }
};

const MonthlyProfit = async () => {
  try {
    const totalRevenue = await orderSchema.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y',
              date: '$dateCreated',
            },
          },
          totalPrice: { $sum: '$totalPrice' },
        },
      },
    ]);
    console.log('Total revenue', totalRevenue[0].totalPrice);

    const MonthlyProfit = 0.25 * totalRevenue[0].totalPrice;
    console.log(MonthlyProfit);
    return MonthlyProfit;
  } catch (error) {
    console.log(error);
  }
};

const totalActiveProductsCount = async () => {
  const totalActiveProductsCount = await productSchema.countDocuments({
    productStatus: true,
  });
  return totalActiveProductsCount;
};

const totalActiveCategories = async () => {
  const totalActiveCategories = await categorySchema.countDocuments({
    categoryStatus: true,
  });
  return totalActiveCategories;
};

const totalPendingOrders = async () => {
  try {
    const activeOrdersCount = await orderSchema.countDocuments({
      orderStatus: 'Pending',
    });
    return activeOrdersCount;
  } catch (error) {
    console.log(error);
  }
};

const monthlyOrdersData = async () => {
  try {
    const pipeline = [
      {
        $group: {
          _id: {
            $month: '$dateCreated',
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $project: {
          _id: 0,
          month: '$_id',
          count: '$count',
        },
      },
      {
        $sort: {
          month: 1,
        },
      },
    ];

    const results = await orderSchema.aggregate(pipeline);
    console.log('Month:', results);
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      count: 0,
    }));
    const ordersByMonth = months.map((m) => {
      const monthResult = results.find((r) => r.month === m.month);
      return monthResult ? monthResult : m;
    });
    console.log('ordersByMonth:', ordersByMonth);
    return ordersByMonth;
  } catch (err) {
    console.log(err);
    return err;
  }
};

const monthlyRetunedOrder=async()=>{
  try {
    const pipeline = [
      {
        $match: {
          returnRequested: true
        }
      },
      {
        $group: {
          _id: {
            $month: '$dateCreated',
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $project: {
          _id: 0,
          month: '$_id',
          count: '$count',
        },
      },
      {
        $sort: {
          month: 1,
        },
      },
    ];

    const results = await orderSchema.aggregate(pipeline);
    console.log('Month:', results);
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      count: 0,
    }));
    const returnedOrdersByMonth = months.map((m) => {
      const monthResult = results.find((r) => r.month === m.month);
      return monthResult ? monthResult : m.count;
    });
    console.log('ordersByMonth:', returnedOrdersByMonth);
    return returnedOrdersByMonth;
  } catch (err) {
    console.log(err);
    return err;
  }

}

const paymentMethodReport = async () => {
  try {
    const paymentMethodStat = await orderSchema.aggregate([
      {
        $group: {
          _id: '$PaymentMethod',
          count: { $sum: 1 },
        },
      },
    ]);
    console.log('paymentMethods', paymentMethodStat);
    const counts = {};
    for (const order of paymentMethodStat) {
      counts[order._id] = order.count;
    }
    const countArray = Object.values(paymentMethodStat); // returns [10, 36]
    const values = countArray.map(({ count }) => count);

    console.log('cOUNT', values);
    return values;
  } catch (error) {
    console.log(error);
  }
};

//Sales Report between dates

const salesReport = async (startDate, endDate) => {
  const salesReportDates = await orderSchema.find({
    orderStatus: "Delivered",
    dateCreated: {$gt: startDate !== null ? startDate : new Date(0),
      $lt: endDate !== null ? endDate : new Date() },
     }).lean();
return salesReportDates;
};

//Sales report CSV
 const generateCsvReport = async (data) => {
    const filePath = 'sales-report.csv';
  

  console.log(data);
    const csvWriter = createCsvWriter({
      path: filePath,
      header: [
        {id: 'title', title: ''},
        {id: 'value', title: 'Sales Report'}
      ]
    });
  
    await csvWriter.writeRecords(data);
  
    return 'sales-report.csv';
  };
    
module.exports = {
  totalRevenue,
  MonthlyProfit,
  totalActiveProductsCount,
  totalActiveCategories,
  totalPendingOrders,
  monthlyOrdersData,
  monthlyRetunedOrder,
  paymentMethodReport,
  salesReport,
  generateCsvReport,
};
