// Import thư viện cần thiết
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = 3000;

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/shop', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Đã kết nối MongoDB'))
  .catch(err => console.log('Lỗi kết nối MongoDB:', err));

// Cấu hình view engine EJS
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Định nghĩa schema cho sản phẩm
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    image: String,
    description: String,
    size: [String],
    color: [String],
    quantity: Number
});

const Product = mongoose.model('Product', productSchema);

// Dữ liệu giỏ hàng (sẽ được lưu trong session sau)
let cart = [];

// Redirect từ '/' sang '/product'
app.get('/', (req, res) => {
    res.redirect('/product');
});

// Route danh sách sản phẩm
app.get('/product', async (req, res) => {
    try {
        const products = await Product.find(); // Lấy sản phẩm từ MongoDB
        res.render('product-list', { products });
    } catch (err) {
        res.status(500).send("Lỗi lấy danh sách sản phẩm");
    }
});

// Route thông tin chi tiết sản phẩm
app.get('/product/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.render('product-detail', { product });
    } catch (err) {
        res.status(500).send("Lỗi lấy chi tiết sản phẩm");
    }
});

// Route thêm sản phẩm vào giỏ hàng
app.post('/cart/add/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            const { size, color, quantity } = req.body;
            const cartItem = {
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                size,
                color,
                quantity: parseInt(quantity, 10)
            };
            cart.push(cartItem);
        }
        res.redirect('/cart');
    } catch (err) {
        res.status(500).send("Lỗi thêm vào giỏ hàng");
    }
});


// Route xóa sản phẩm khỏi giỏ hàng (xóa từng sản phẩm)
app.post('/cart/add/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            let { size, color, quantity } = req.body;
            
            // Chắc chắn quantity là số hợp lệ
            quantity = parseInt(quantity, 10);
            if (isNaN(quantity) || quantity <= 0) {
                quantity = 1; // Mặc định là 1 nếu không hợp lệ
            }

            const cartItem = {
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                size,
                color,
                quantity
            };

            cart.push(cartItem);
        }
        res.redirect('/cart');
    } catch (err) {
        res.status(500).send("Lỗi thêm vào giỏ hàng");
    }
});


// Route hiển thị giỏ hàng
app.get('/cart', (req, res) => {
    console.log(cart); // Kiểm tra giá trị quantity
    res.render('cart', { cart });
});


// Lắng nghe cổng
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
app.post('/cart/remove/:index', (req, res) => {
    const index = parseInt(req.params.index, 10);
    if (!isNaN(index) && index >= 0 && index < cart.length) {
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1; // Giảm số lượng
        } else {
            cart.splice(index, 1); // Xóa khỏi giỏ nếu số lượng là 1
        }
    }
    res.redirect('/cart');
});
