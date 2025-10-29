package com.ofs_160.webdev.Service;

import com.ofs_160.webdev.DTO.ProductDTO;
import com.ofs_160.webdev.Model.Product;
import com.ofs_160.webdev.Repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    // The service class we are testing
    @InjectMocks
    private ProductService productService;

    // The dependency that needs to be mocked
    @Mock
    private ProductRepository productRepository;

    private Product testProduct;

    @BeforeEach
    void setUp() {
        testProduct = new Product(
                1, 
                "Laptop Pro", 
                new BigDecimal("1200.00"), 
                10, 
                new BigDecimal("2.5"), 
                "laptop.jpg", 
                "image/jpeg", 
                new byte[]{1, 2, 3}
        );
    }

    // --- Service Method Tests ---

    @Test
    void getAllProducts_ShouldReturnListOfProducts() {
        // Arrange
        Product product2 = new Product();
        List<Product> expectedProducts = Arrays.asList(testProduct, product2);
        when(productRepository.findAll()).thenReturn(expectedProducts);

        // Act
        List<Product> actualProducts = productService.getAllProducts();

        // Assert
        assertEquals(2, actualProducts.size());
        assertEquals("Laptop Pro", actualProducts.get(0).getName());
        verify(productRepository, times(1)).findAll();
    }

    @Test
    void findProductById_ExistingId_ShouldReturnProduct() {
        // Arrange
        when(productRepository.findById(1)).thenReturn(Optional.of(testProduct));

        // Act
        Product foundProduct = productService.findProductById(1);

        // Assert
        assertNotNull(foundProduct);
        assertEquals(1, foundProduct.getId());
        assertEquals("Laptop Pro", foundProduct.getName());
        verify(productRepository, times(1)).findById(1);
    }

    @Test
    void findProductById_NonExistingId_ShouldReturnNull() {
        // Arrange
        when(productRepository.findById(99)).thenReturn(Optional.empty());

        // Act
        Product foundProduct = productService.findProductById(99);

        // Assert
        assertNull(foundProduct);
        verify(productRepository, times(1)).findById(99);
    }

    @Test
    void deleteProductById_ShouldCallDeleteById() {
        // Act
        productService.deleteProductById(1);

        // Assert
        verify(productRepository, times(1)).deleteById(1);
    }

    @Test
    void insertProduct_ShouldCallSave() {
        // Arrange
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        // Act
        productService.insertProduct(testProduct);

        // Assert
        verify(productRepository, times(1)).save(testProduct);
    }

    @Test
    void updateProduct_ShouldCallSave() {
        // Arrange
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        // Act
        productService.updateProduct(testProduct);

        // Assert
        verify(productRepository, times(1)).save(testProduct);
    }

    @Test
    void addProductImage_ShouldSetImageDetailsAndSave() throws IOException {
        // Arrange
        byte[] imageContent = "test image data".getBytes();
        MultipartFile mockImageFile = new MockMultipartFile(
                "imageFile",
                "test-image.png",
                "image/png",
                imageContent
        );
        Product productWithoutImage = new Product();
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        // Act
        Product savedProduct = productService.addProductImage(productWithoutImage, mockImageFile);

        // Assert
        assertNotNull(savedProduct);
        assertEquals("test-image.png", productWithoutImage.getImageName());
        assertEquals("image/png", productWithoutImage.getImageType());
        assertArrayEquals(imageContent, productWithoutImage.getImageData());
        verify(productRepository, times(1)).save(productWithoutImage);
    }

    // --- DTO Constructor Test ---

    @Test
    void productDTO_Constructor_ShouldMapProductCorrectly() {
        // Act
        ProductDTO dto = new ProductDTO(testProduct);

        // Assert
        assertEquals("1", dto.getId(), "ID should be converted to String");
        assertEquals("Laptop Pro", dto.getName());
        assertEquals(new BigDecimal("1200.00"), dto.getCost());
        assertEquals(new BigDecimal("2.5"), dto.getWeight());
        assertEquals(10, dto.getStock());
        assertNull(dto.getImageUrl(), "ImageUrl field is commented out in DTO");
    }
}