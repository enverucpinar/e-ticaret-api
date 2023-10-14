//Temel Değişkenler
const productList = document.getElementById("productList");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const categoryList = document.getElementById("categoryList");
const cartCount = document.getElementById("sepetMiktar");
const API_URL = "https://fakestoreapi.com/products";

//Boş Sepet dizimizi oluşturalım
var cart = [];

//Sepete Ürün Eklemek İçin Fonksiyon Hazırlanması
function addProductToCart(urun) {
  //Önce sepete nasıl özelliklere sahip bir ürün ekleyeceğimizi tanımlayalım.
  const cartItem = {
    id: urun.id,
    title: urun.title,
    price: urun.price,
    thumbnail: urun.thumbnail,
    quantity: 1, //Başlangıç değeri olarak varsayılan miktar 1 olacak.
  };

  //Sepetteki bütün ürünleri gez ve sepetteki herhangi bir ürüne ait olan id şuan eklemeye çalıştığım ürünün id'si ile eşitse o ürünün sadece miktarını arttır ve metottan çık.
  for (const item of cart) {
    if (item.id === cartItem.id) {
      item.quantity++;
      //Sepeti güncelleme metodu devreye girer.
      updateCartCount();
      displayCart();
      return;
    }
  }

  //Ürünü sepete ekle
  cart.push(cartItem);
  updateCartCount();
  displayCart();
}
//Sepetteki ürünlerin sayısını güncellemek için fonksiyon hazırlanması
function updateCartCount() {
  var totalCount = 0;

  for (var item of cart) {
    totalCount += item.quantity;
  }

  cartCount.textContent = `(${totalCount})`;
}

//Sepetteki ürünlerin görüntülenmesi için bir fonksiyon
function displayCart() {
  const sepetListesi = document.getElementById("sepetListesi");
  const toplamFiyat = document.getElementById("toplamFiyat");

  //Sepetin içeriğini temizleyelim.
  sepetListesi.innerHTML = "";

  //Sepet boşşa sepet boş mesajını göster
  if (cart.length === 0) {
    sepetListesi.innerHTML = `
    <div class="alert alert-danger" role="alert">
       Sepetinizde hiç ürün bulunmamaktadır :(
    </div>
    `;
    toplamFiyat.textContent = 0;
    return;
  }

  cart.map((item) => {
    const sepetNesnesi = document.createElement("div");
    sepetNesnesi.classList.add(
      "d-flex",
      "justify-content-between",
      "align-items-center",
      "mb-2"
    );

    sepetNesnesi.innerHTML = `
    <div class="d-flex align-items-center">
      <img src=${item.image} alt=${item.title} width="100px" height="100px"/>
      <div class="ms-3" >
        <p>${item.title}</p>
        <p>Fiyat: ${item.price}</p>
        <p>Miktar: ${item.quantity}</p>
      </div>
    </div>
    <button class="btn btn-danger btn-remove-from-cart" data-id="${item.id}">Kaldır</button>
    
    `;

    sepetListesi.appendChild(sepetNesnesi);

    //sepetteki ürünlerin kaldırılması
    const removeButton = sepetNesnesi.querySelector(".btn-remove-from-cart");
    removeButton.addEventListener("click", () => {
      const silinecekId = parseInt(removeButton.getAttribute("data-id"));
      removeProductFromCart(silinecekId);
      displayCart();
    });
  });

  //Toplam fiyatın hesaplanması
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  toplamFiyat.textContent = total;
}

document.getElementById("sepetButon").addEventListener("click", displayCart());

//Sepetteki ürünlerin silinmesi için bir fonksiyon
function removeProductFromCart(productId) {
  const indexNo = cart.findIndex((item) => item.id === productId);
  if (indexNo !== -1) {
    cart.splice(indexNo, 1); //Ürünü Sepetten Kaldır
    updateCartCount();
  }
}

//Ürünleri tutacağım boş array
var products = [];
//API'lardan ürünün çekilmesi

function fetchProducts() {
  fetch(API_URL)
    .then((res) => res.json())
    .then((data) => {
      //Ürünleri tutan boş array'i fetch'ten gelen dolu arrayle dolduruyorum.
      products = data;
      displayProducts(products);
      displayCategories();
    });
}

//Ürünleri görüntülemek için fonksiyon
function displayProducts(products) {
  productList.innerHTML = "";

  products.forEach((product) => {
    //Her ürün için bir kart tasarımı
    const card = document.createElement("div");
    card.classList.add("col-md-4", "my-2");
    card.innerHTML = `
        <div class="card" style="height:550px">
            <img src=${product.image} class="card-img-top img-fluid" style="height: 400px " alt=${product.title}/>
            <div class="card-body bg-secondary">
                <h6 class="card-title text-light">${product.title}</h5>
                <p class="card-text text-light">${product.price} TL</p>
                <button class="btn btn-add-to-cart bg-light" data-id=${product.id}> SEPETE EKLE! </button>
            </div>
        </div>
    `;

    //Kartı ürün listesine appendliycez
    productList.appendChild(card);

    //Sepete Ekle! butonlarımıza tıklama olaylarını ekliyoruz.
    const addToCartButton = card.querySelector(".btn-add-to-cart");
    addToCartButton.addEventListener("click", () => {
      const productId = parseInt(addToCartButton.getAttribute("data-id"));
      const selectedProduct = products.find((p) => p.id === productId);
      //Şimdi butona tıkladığımızda hangi ürün olduğunu seçtik ve sırada da bu ürünü sepete eklemek kaldı. Bunun için addProductToCart isimli bir fonksiyon oluşturalım.
      addProductToCart(selectedProduct);
    });
  });
}

const all = document.getElementById("all");
all.addEventListener("click", () => {
  displayProducts(products);
});
//Kategorileri görüntüleyeceğimiz fonksiyon
function displayCategories() {
  const categories = [];

  products.map((product) => {
    //Eğer ki categories isimli dizimin içerisinde daha önce pushlamış olduğum herhangi bir ürün kategorisi varsa tekrardan bu diziye eklemek itemiyorum. Çünkü amacım bütün kategorileri tekil şekilde display etmek. Bu yüzden aşağıdaki gibi bir koşul ekledim.
    if (!categories.includes(product.category)) {
      categories.push(product.category);
    }

    categoryList.innerHTML = "";
    //yukarıda başlangıçta boş bir array olan sonrasında doldurduğum categories isimli arrayimi mapliyorum.
    categories.forEach((category) => {
      const listItem = document.createElement("li");
      listItem.classList.add("list-group-item", "mx-5");
      listItem.textContent = category;

      //ilgili kategoriye tıklanınca o kategorideki ürünleri getirelim
      listItem.addEventListener("click", () => {
        const filteredProducts = products.filter(
          (x) => x.category === category
        );
        displayProducts(filteredProducts);
      });

      categoryList.appendChild(listItem);
    });
  });
}

searchButton.addEventListener("click", searchProducts);

function searchProducts() {
  const searchItem = searchInput.value.toLowerCase().trim();

  const searchedProducts = products.filter(
    (x) =>
      x.title.toLowerCase().includes(searchItem) ||
      x.description.includes(searchItem)
  );

  displayProducts(searchedProducts);
}

searchInput.addEventListener("keyup", keyup);

function keyup() {
  const searchItem = searchInput.value.toLowerCase().trim();

  const searchedProducts = products.filter(
    (x) =>
      x.title.toLowerCase().includes(searchItem) ||
      x.description.includes(searchItem)
  );

  displayProducts(searchedProducts);
}

fetchProducts();
