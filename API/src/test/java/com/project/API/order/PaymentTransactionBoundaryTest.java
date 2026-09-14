package com.project.API.order;

import jakarta.transaction.Transactional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.stereotype.Service;

import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Trava o que quebrou o webhook do Mercado Pago em produção.
 *
 * handlePaymentResult() vivia dentro de OrderServiceImp e era chamado por
 * processPayment() em `this`. @Transactional só vale quando a chamada passa pelo
 * proxy do Spring, então a auto-invocação anulava a anotação: decrementStock(),
 * que é uma query @Modifying, rodava sem transação e estourava
 * "No active transaction for update or delete query" — antes do save(), de modo
 * que o pedido continuava PENDING mesmo com o pagamento aprovado.
 *
 * Os testes de unidade não pegam isso: com repositórios mockados não há transação
 * nenhuma para faltar, e o método chamado direto na instância nua sempre funciona.
 * O que dá para travar sem subir banco é a estrutura que torna a transação
 * possível — é o que estes testes fazem.
 */
class PaymentTransactionBoundaryTest {

    @Test
    @DisplayName("o handler é public e @Transactional, requisito para o proxy advisar a chamada")
    void handler_shouldBePublicAndTransactional() throws Exception {
        Method handle = PaymentResultHandler.class.getDeclaredMethod(
                "handlePaymentResult", String.class, String.class, String.class);

        assertTrue(Modifier.isPublic(handle.getModifiers()),
                "handlePaymentResult precisa ser public para o proxy do Spring aplicar @Transactional");
        assertNotNull(handle.getAnnotation(Transactional.class),
                "sem @Transactional, decrementStock() volta a rodar fora de transação");
    }

    @Test
    @DisplayName("o handler é um bean próprio, não um método interno do OrderServiceImp")
    void handler_shouldBeItsOwnBean() {
        assertNotNull(PaymentResultHandler.class.getAnnotation(Service.class),
                "o handler precisa ser um bean para que a chamada passe pelo proxy");
    }

    @Test
    @DisplayName("OrderServiceImp não reintroduz o handler internamente")
    void orderService_shouldNotDeclareTheHandlerItself() {
        boolean declaresIt = Arrays.stream(OrderServiceImp.class.getDeclaredMethods())
                .anyMatch(m -> m.getName().equals("handlePaymentResult"));

        assertFalse(declaresIt,
                "mover handlePaymentResult de volta para OrderServiceImp recria a auto-invocação "
                        + "que deixou o pedido PENDING depois de pago");
    }

    @Test
    @DisplayName("processPayment delega ao handler injetado")
    void orderService_shouldDependOnTheHandler() {
        boolean injectsHandler = Arrays.stream(OrderServiceImp.class.getDeclaredFields())
                .anyMatch(f -> f.getType().equals(PaymentResultHandler.class));

        assertTrue(injectsHandler,
                "processPayment precisa chamar o handler por um colaborador injetado, não por `this`");
    }
}
