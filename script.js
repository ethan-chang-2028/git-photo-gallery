const similarFoods = {
    'Coffee': ['Espresso', 'Cappuccino', 'Americano', 'Latte', 'Mocha'],
    'Matcha Latte': ['Green Tea', 'Chai Latte', 'Turmeric Latte', 'Iced Matcha', 'Matcha Frappuccino'],
    'Macchiato': ['Cortado', 'Flat White', 'Espresso Macchiato', 'Caramel Macchiato', 'Vanilla Macchiato'],
    'Tiramisu Milkshake': ['Vanilla Milkshake', 'Chocolate Milkshake', 'Strawberry Milkshake', 'Cookies & Cream Milkshake', 'Banana Milkshake'],
    'Iced Coffee': ['Cold Brew', 'Nitro Coffee', 'Iced Americano', 'Iced Caramel Macchiato', 'Frappuccino'],
    'Lemonade': ['Strawberry Lemonade', 'Mint Lemonade', 'Pineapple Lemonade', 'Raspberry Lemonade', 'Classic Iced Tea'],
    'Orecchiette with Tuna': ['Pasta Primavera', 'Spaghetti Carbonara', 'Linguine with Clams', 'Fettuccine Alfredo', 'Penne alla Vodka'],
    'Artisan Pizza': ['Margherita Pizza', 'Pepperoni Pizza', 'Vegetarian Pizza', 'White Pizza', 'BBQ Chicken Pizza'],
    'Garden Side Salad': ['Caesar Salad', 'Greek Salad', 'Caprese Salad', 'Cobb Salad', 'Spinach Salad'],
    'Grilled Salmon': ['Baked Salmon', 'Poached Salmon', 'Salmon Teriyaki', 'Cedar Plank Salmon', 'Honey Glazed Salmon'],
    'Beef Burger': ['Chicken Burger', 'Veggie Burger', 'Turkey Burger', 'Cheeseburger', 'Bacon Burger'],
    'Dark Chocolate Cake': ['Milk Chocolate Cake', 'Red Velvet Cake', 'Carrot Cake', 'Devils Food Cake', 'Flourless Chocolate Cake'],
    'Dairy-Free Vanilla Ice Cream': ['Chocolate Ice Cream', 'Strawberry Ice Cream', 'Mint Chocolate Chip', 'Cookie Dough Ice Cream', 'Vanilla Bean Ice Cream'],
    'Strawberry Shortcake': ['Blueberry Shortcake', 'Raspberry Shortcake', 'Peach Shortcake', 'Mixed Berry Shortcake', 'Chocolate Strawberry Shortcake'],
    'Tiramisu': ['Cheesecake', 'Panna Cotta', 'Cannoli', 'Zabaglione', 'Affogato'],
    'Chocolate Chip Cookies': ['Oatmeal Raisin Cookies', 'Peanut Butter Cookies', 'Sugar Cookies', 'Snickerdoodle Cookies', 'Double Chocolate Cookies'],
    'Cheesecake': ['New York Cheesecake', 'Strawberry Cheesecake', 'Chocolate Cheesecake', 'Lemon Cheesecake', 'Oreo Cheesecake'],
    'Blueberry Muffin': ['Banana Nut Muffin', 'Chocolate Chip Muffin', 'Bran Muffin', 'Lemon Poppy Seed Muffin', 'Pumpkin Muffin'],
    'Croissant': ['Pain au Chocolat', 'Almond Croissant', 'Ham and Cheese Croissant', 'Cinnamon Roll', 'Danish Pastry'],
    'Pancakes': ['Waffles', 'French Toast', 'Crepes', 'Dutch Baby Pancake', 'Banana Pancakes']
};

function selectImage(card) {
    const cards = document.querySelectorAll('.card');
    cards.forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    
    const foodName = card.querySelector('.card-title').textContent;
    const similarFoodsList = similarFoods[foodName] || [];
    
    let resultHTML = '<h3>Similar Foods:</h3>';
    if (similarFoodsList.length > 0) {
        resultHTML += similarFoodsList.map(food => `<span class="food-tag">${food}</span>`).join('');
    } else {
        resultHTML += '<p>No similar foods found.</p>';
    }
    
    const relatedFoodsContainer = document.getElementById('related-foods');
    if (relatedFoodsContainer) {
        relatedFoodsContainer.innerHTML = resultHTML;
    } else {
        const newContainer = document.createElement('div');
        newContainer.id = 'related-foods';
        newContainer.className = 'related-foods';
        newContainer.innerHTML = resultHTML;
        card.parentNode.parentNode.appendChild(newContainer);
    }
}
