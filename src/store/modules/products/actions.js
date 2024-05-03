import axios from "axios";

export default {
  deleteProduct(_, id) {
    console.log("deleteProduct", id);
    return new Promise((resolve, reject) =>
      axios
        .delete(`products/${id}`)
        .then(({ data: r }) => resolve(r))
        .catch(({ response: { data: err } }) => reject(err))
    );
  }
};
