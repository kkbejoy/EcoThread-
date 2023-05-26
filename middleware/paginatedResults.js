

const paginatedResults = (model) => {
  return async (req, res, next) => {
    let page = parseInt(req.query.page);
    if (!page) page = 1;
    let limit;
    if(model.modelName === 'Product'){
        limit = 9;
    }
     else{
        limit=10;
     }
     
    console.log('modal:', model);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    // console.log('model', model.countDocuments().exec());
    const results = {};
     await model.countDocuments().then((count)=>{
        results.resultsCount=count;

     });
    if (endIndex < (await model.countDocuments().exec())) {
      results.next = {
        page: page + 1,
      };
    }
    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
      };
    }
    let totalListCount = {};
    await model
      .countDocuments()
      .lean()
      .then((count) => {
        console.log('count', count);
        totalListCount.count = count;
        // use totalListCount here
      });

    const totalPages = Math.ceil(totalListCount.count / limit);
    results.totalPageNo = totalPages;
    try {
      if (model.modelName === 'Product') {
        results.results = await model
          .find()
          .populate('category')
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip(startIndex)
          .lean();
      }

      if (model.modelName === 'Order') {
        results.results = await model
          .find()
          .populate('customer deliveryAddress products.product')
          // .populate({
          //   path: 'products.product',
          //   select: 'name price ',
          // })
          .sort({ dateCreated: -1 })
          .limit(limit)
          .skip(startIndex)
          .lean();
      }

      res.paginatedResults = results;
      console.log(res.paginatedResults)

      next();
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  };
};
module.exports = {
  paginatedResults,
};
