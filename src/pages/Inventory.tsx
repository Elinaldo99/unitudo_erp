import React, { useState } from "react";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
};

const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: "Adaptador HUB 7 em 1",
      category: "Eletrônicos",
      price: 115,
      quantity: 8,
    },
  ]);

  const [search, setSearch] = useState("");

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "24px" }}>

      {/* HEADER */}
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontWeight: 600 }}>Produtos</h2>
      </div>

      {/* SEARCH + ACTIONS */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
          gap: "10px",
        }}
      >
        <input
          type="text"
          placeholder="🔍 Buscar por nome, código ou barras..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ddd",
          }}
        />

        <button
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          ⚙️ Filtros
        </button>

        <button
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          + Novo Produto
        </button>
      </div>

      {/* GRID DE PRODUTOS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
        }}
      >
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            style={{
              border: "1px solid #eee",
              borderRadius: "12px",
              overflow: "hidden",
              background: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            {/* IMAGE */}
            <div
              style={{
                height: "140px",
                background: "#f3f4f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#aaa",
                fontSize: "14px",
              }}
            >
              📷 Imagem
            </div>

            {/* BODY */}
            <div style={{ padding: "12px" }}>

              {/* STOCK BADGE */}
              <div
                style={{
                  display: "inline-block",
                  background: "#2563eb",
                  color: "#fff",
                  fontSize: "12px",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  marginBottom: "8px",
                }}
              >
                ESTOQUE: {product.quantity} UN
              </div>

              {/* CATEGORY */}
              <div
                style={{
                  fontSize: "11px",
                  color: "#888",
                  textTransform: "uppercase",
                }}
              >
                {product.category}
              </div>

              {/* NAME + PRICE */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "4px",
                }}
              >
                <strong style={{ fontSize: "14px" }}>
                  {product.name}
                </strong>

                <span
                  style={{
                    color: "#2563eb",
                    fontWeight: 600,
                  }}
                >
                  R$ {product.price.toFixed(2)}
                </span>
              </div>

              {/* FOOTER */}
              <div
                style={{
                  marginTop: "10px",
                  fontSize: "12px",
                  color: "#777",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>🏷️ S/ Código</span>
                <span>📦 Padrão</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <p style={{ marginTop: "20px", color: "#888" }}>
          Nenhum produto encontrado.
        </p>
      )}
    </div>
  );
};

export default Inventory;