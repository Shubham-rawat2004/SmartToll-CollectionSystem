package com.smarttoll.restapi.product;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class ProductService {

    private final Map<Long, Product> products = new LinkedHashMap<>();
    private final AtomicLong idSequence = new AtomicLong(0);

    public ProductService() {
        create(new Product(null, "RFID Tag", "Hardware", new BigDecimal("499.00")));
        create(new Product(null, "Fastag Scanner", "Equipment", new BigDecimal("1200.00")));
    }

    public List<Product> findAll() {
        return products.values().stream()
                .sorted(Comparator.comparing(Product::getId))
                .toList();
    }

    public Product findById(Long id) {
        Product product = products.get(id);
        if (product == null) {
            throw new ProductNotFoundException(id);
        }
        return product;
    }

    public Product create(Product product) {
        long id = idSequence.incrementAndGet();
        Product saved = new Product(id, product.getName(), product.getCategory(), product.getPrice());
        products.put(id, saved);
        return saved;
    }

    public Product update(Long id, Product product) {
        if (!products.containsKey(id)) {
            throw new ProductNotFoundException(id);
        }

        Product updated = new Product(id, product.getName(), product.getCategory(), product.getPrice());
        products.put(id, updated);
        return updated;
    }

    public void delete(Long id) {
        if (products.remove(id) == null) {
            throw new ProductNotFoundException(id);
        }
    }
}
