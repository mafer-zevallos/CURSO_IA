import { useEffect, useMemo, useState } from "react";

const storageKey = "saldo-fino-state";

const views = [
  { id: "dashboard", label: "Inicio", icon: "I" },
  { id: "gastos", label: "Gastos", icon: "G" },
  { id: "nuevo", label: "Movimiento", icon: "+" },
  { id: "categorias", label: "Categorias", icon: "C" },
  { id: "reportes", label: "Reportes", icon: "R" },
];

const seedCategories = ["Casa", "Comida", "Movilidad", "Servicios", "Ocio"];

const seedExpenses = [
  { id: 1, description: "Comida para Arthur", category: "Casa", date: "2026-04-06", amount: 5 },
  { id: 2, description: "Almuerzo", category: "Comida", date: "2026-04-06", amount: 6 },
  { id: 3, description: "Mercado rapido", category: "Casa", date: "2026-04-05", amount: 5 },
];

function createInitialState() {
  return {
    categories: seedCategories,
    expenses: seedExpenses,
  };
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date) {
  return new Intl.DateTimeFormat("es-PE", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function monthKey(date) {
  return date.slice(0, 7);
}

function monthLabel(month) {
  return new Intl.DateTimeFormat("es-PE", {
    month: "long",
    year: "numeric",
  }).format(new Date(`${month}-01T00:00:00`));
}

function iconForCategory(category) {
  return category.trim().charAt(0).toUpperCase() || "G";
}

function toneForCategory(category) {
  const tones = ["slate", "orange", "violet", "mint", "rose"];
  let hash = 0;

  for (const char of category) {
    hash += char.charCodeAt(0);
  }

  return tones[hash % tones.length];
}

function emptyForm(category = "") {
  return {
    id: null,
    description: "",
    amount: "",
    category,
    date: "2026-04-07",
  };
}

function DashboardView({ expenses, totalSpent, monthlyTotal, onNavigate, month }) {
  const recentExpenses = expenses.slice(0, 4);

  return (
    <section className="mobile-screen">
      <header className="topbar">
        <div>
          <p className="app-name">SALDO FINO</p>
          <strong className="topbar-title">Control de gastos</strong>
        </div>
        <button className="ghost-button" onClick={() => onNavigate("nuevo")} type="button">
          Nuevo
        </button>
      </header>

      <section className="hero-card">
        <p className="summary-label">Gastado este mes</p>
        <div className="summary-row">
          <strong>{formatCurrency(monthlyTotal)}</strong>
          <span>{monthLabel(month)}</span>
        </div>
        <div className="hero-metrics">
          <article>
            <span>Total historico</span>
            <strong>{formatCurrency(totalSpent)}</strong>
          </article>
          <article>
            <span>Movimientos</span>
            <strong>{expenses.length}</strong>
          </article>
        </div>
      </section>

      <section className="section-head">
        <h2>Ultimos gastos</h2>
        <button className="section-link" onClick={() => onNavigate("gastos")} type="button">
          Ver todos
        </button>
      </section>

      <div className="transaction-list">
        {recentExpenses.length ? (
          recentExpenses.map((expense) => (
            <article className="transaction-card" key={expense.id}>
              <div className={`transaction-icon ${toneForCategory(expense.category)}`}>{iconForCategory(expense.category)}</div>
              <div className="transaction-body">
                <strong>{expense.description}</strong>
                <span>
                  {expense.category} · {formatDate(expense.date)}
                </span>
              </div>
              <div className="transaction-amount">-{formatCurrency(expense.amount)}</div>
            </article>
          ))
        ) : (
          <EmptyState title="Aun no hay gastos" text="Crea el primer movimiento para empezar a registrar gastos." />
        )}
      </div>
    </section>
  );
}

function ExpensesView({ expenses, onEdit, onDelete }) {
  return (
    <section className="mobile-screen">
      <header className="page-header">
        <div>
          <p>Gastos</p>
          <strong>{expenses.length} registros</strong>
        </div>
      </header>

      <div className="expense-stack">
        {expenses.length ? (
          expenses.map((expense) => (
            <article className="expense-block" key={expense.id}>
              <div className="expense-block-top">
                <div className={`transaction-icon ${toneForCategory(expense.category)}`}>{iconForCategory(expense.category)}</div>
                <div>
                  <strong>{expense.description}</strong>
                  <span>
                    {expense.category} · {formatDate(expense.date)}
                  </span>
                </div>
                <strong className="expense-price">-{formatCurrency(expense.amount)}</strong>
              </div>
              <div className="inline-actions">
                <button className="inline-button" onClick={() => onEdit(expense)} type="button">
                  Editar
                </button>
                <button className="inline-button danger" onClick={() => onDelete(expense.id)} type="button">
                  Eliminar
                </button>
              </div>
            </article>
          ))
        ) : (
          <EmptyState title="No hay movimientos" text="Agrega un gasto para habilitar el historial." />
        )}
      </div>
    </section>
  );
}

function ExpenseFormView({ categories, form, error, isEditing, onChange, onSubmit, onCancel }) {
  return (
    <section className="mobile-screen">
      <header className="welcome-card">
        <p className="welcome-eyebrow">SALDO FINO</p>
        <h1>{isEditing ? "Editar gasto" : "Registrar gasto"}</h1>
        <strong>{isEditing ? "Actualiza el movimiento seleccionado." : "Guarda un nuevo movimiento con monto, fecha y categoria."}</strong>
      </header>

      <form className="mobile-form" onSubmit={onSubmit}>
        <label>
          <span>Descripcion</span>
          <input name="description" onChange={onChange} placeholder="Ejemplo: pan, taxi, mercado" type="text" value={form.description} />
        </label>
        <label>
          <span>Monto</span>
          <input name="amount" onChange={onChange} placeholder="0.00" step="0.01" type="number" value={form.amount} />
        </label>
        <label>
          <span>Categoria</span>
          <select name="category" onChange={onChange} value={form.category}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Fecha</span>
          <input name="date" onChange={onChange} type="date" value={form.date} />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <div className="form-actions">
          <button className="add-submit" type="submit">
            {isEditing ? "Guardar cambios" : "Guardar gasto"}
          </button>
          {isEditing ? (
            <button className="secondary-button" onClick={onCancel} type="button">
              Cancelar edicion
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}

function CategoriesView({ categories, usageByCategory, value, error, onChange, onSubmit, onDelete }) {
  return (
    <section className="mobile-screen">
      <header className="page-header">
        <div>
          <p>Categorias</p>
          <strong>{categories.length} activas</strong>
        </div>
      </header>

      <form className="category-form" onSubmit={onSubmit}>
        <input onChange={onChange} placeholder="Nueva categoria" type="text" value={value} />
        <button className="secondary-button solid" type="submit">
          Agregar
        </button>
      </form>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="category-grid">
        {categories.map((category) => (
          <article className="category-card" key={category}>
            <div className={`transaction-icon ${toneForCategory(category)}`}>{iconForCategory(category)}</div>
            <div>
              <strong>{category}</strong>
              <span>{usageByCategory[category] ?? 0} gastos asociados</span>
            </div>
            <button className="inline-button danger" onClick={() => onDelete(category)} type="button">
              Eliminar
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function ReportsView({ expenses, monthlySeries, categorySeries, currentMonthTotal }) {
  const maxMonthly = Math.max(...monthlySeries.map((item) => item.total), 1);
  const maxCategory = Math.max(...categorySeries.map((item) => item.total), 1);

  return (
    <section className="mobile-screen">
      <header className="page-header">
        <div>
          <p>Reportes</p>
          <strong>Vista mensual y por categoria</strong>
        </div>
      </header>

      <div className="report-cards">
        <article className="report-card accent">
          <span>Total del mes actual</span>
          <strong>{formatCurrency(currentMonthTotal)}</strong>
        </article>
        <article className="report-card">
          <span>Total de movimientos</span>
          <strong>{expenses.length}</strong>
        </article>
      </div>

      <section className="chart-card">
        <div className="section-head compact">
          <h2>Gasto por mes</h2>
        </div>
        {monthlySeries.length ? (
          <div className="bar-list">
            {monthlySeries.map((item) => (
              <div className="bar-row" key={item.month}>
                <div className="bar-meta">
                  <strong>{monthLabel(item.month)}</strong>
                  <span>{formatCurrency(item.total)}</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(item.total / maxMonthly) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="Sin datos mensuales" text="Necesitas registrar gastos para calcular el reporte." />
        )}
      </section>

      <section className="chart-card">
        <div className="section-head compact">
          <h2>Gasto por categoria</h2>
        </div>
        {categorySeries.length ? (
          <div className="bar-list">
            {categorySeries.map((item) => (
              <div className="bar-row" key={item.category}>
                <div className="bar-meta">
                  <strong>{item.category}</strong>
                  <span>{formatCurrency(item.total)}</span>
                </div>
                <div className="bar-track soft">
                  <div className={`bar-fill ${toneForCategory(item.category)}`} style={{ width: `${(item.total / maxCategory) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="Sin datos por categoria" text="El detalle por categoria aparecera cuando existan gastos." />
        )}
      </section>
    </section>
  );
}

function EmptyState({ title, text }) {
  return (
    <article className="empty-card">
      <strong>{title}</strong>
      <span>{text}</span>
    </article>
  );
}

function BottomNav({ currentView, onNavigate }) {
  return (
    <nav className="bottom-nav">
      {views.map((view) => (
        <button
          key={view.id}
          className={`bottom-link ${currentView === view.id ? "is-active" : ""}`}
          onClick={() => onNavigate(view.id)}
          type="button"
        >
          <span className={`bottom-icon ${view.id === "nuevo" ? "is-add" : ""}`}>{view.icon}</span>
          <span>{view.label}</span>
        </button>
      ))}
    </nav>
  );
}

function ActiveView(props) {
  switch (props.currentView) {
    case "dashboard":
      return <DashboardView expenses={props.expenses} month={props.currentMonth} monthlyTotal={props.monthlyTotal} onNavigate={props.onNavigate} totalSpent={props.totalSpent} />;
    case "gastos":
      return <ExpensesView expenses={props.expenses} onDelete={props.onDeleteExpense} onEdit={props.onEditExpense} />;
    case "categorias":
      return (
        <CategoriesView
          categories={props.categories}
          error={props.categoryError}
          onChange={props.onCategoryDraftChange}
          onDelete={props.onDeleteCategory}
          onSubmit={props.onCategorySubmit}
          usageByCategory={props.usageByCategory}
          value={props.categoryDraft}
        />
      );
    case "reportes":
      return (
        <ReportsView
          categorySeries={props.categorySeries}
          currentMonthTotal={props.monthlyTotal}
          expenses={props.expenses}
          monthlySeries={props.monthlySeries}
        />
      );
    default:
      return (
        <ExpenseFormView
          categories={props.categories}
          error={props.formError}
          form={props.form}
          isEditing={props.isEditing}
          onCancel={props.onCancelEdit}
          onChange={props.onExpenseChange}
          onSubmit={props.onExpenseSubmit}
        />
      );
  }
}

export default function App() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [data, setData] = useState(() => {
    if (typeof window === "undefined") return createInitialState();

    const raw = window.localStorage.getItem(storageKey);

    if (!raw) return createInitialState();

    try {
      const parsed = JSON.parse(raw);
      return {
        categories: Array.isArray(parsed.categories) && parsed.categories.length ? parsed.categories : seedCategories,
        expenses: Array.isArray(parsed.expenses) ? parsed.expenses : seedExpenses,
      };
    } catch {
      return createInitialState();
    }
  });
  const [formError, setFormError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [categoryDraft, setCategoryDraft] = useState("");
  const [form, setForm] = useState(() => emptyForm(seedCategories[0]));

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    setForm((current) => {
      if (data.categories.includes(current.category)) {
        return current;
      }

      return { ...current, category: data.categories[0] ?? "" };
    });
  }, [data.categories]);

  const expenses = useMemo(
    () => [...data.expenses].sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime()),
    [data.expenses],
  );
  const totalSpent = useMemo(() => expenses.reduce((acc, item) => acc + item.amount, 0), [expenses]);
  const currentMonth = useMemo(() => {
    const latestExpense = expenses[0]?.date ?? "2026-04-07";
    return monthKey(latestExpense);
  }, [expenses]);
  const monthlyTotal = useMemo(
    () => expenses.filter((expense) => monthKey(expense.date) === currentMonth).reduce((acc, item) => acc + item.amount, 0),
    [currentMonth, expenses],
  );
  const usageByCategory = useMemo(
    () =>
      expenses.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] ?? 0) + 1;
        return acc;
      }, {}),
    [expenses],
  );
  const monthlySeries = useMemo(() => {
    const summary = expenses.reduce((acc, item) => {
      const key = monthKey(item.date);
      acc[key] = (acc[key] ?? 0) + item.amount;
      return acc;
    }, {});

    return Object.entries(summary)
      .map(([month, total]) => ({ month, total }))
      .sort((left, right) => left.month.localeCompare(right.month));
  }, [expenses]);
  const categorySeries = useMemo(() => {
    const summary = expenses.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] ?? 0) + item.amount;
      return acc;
    }, {});

    return Object.entries(summary)
      .map(([category, total]) => ({ category, total }))
      .sort((left, right) => right.total - left.total);
  }, [expenses]);

  function resetForm(nextCategory = data.categories[0] ?? "") {
    setForm(emptyForm(nextCategory));
    setEditingId(null);
    setFormError("");
  }

  function handleExpenseChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleExpenseSubmit(event) {
    event.preventDefault();

    if (!form.description.trim()) {
      setFormError("La descripcion es obligatoria.");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setFormError("El monto debe ser mayor que cero.");
      return;
    }

    if (!form.date) {
      setFormError("La fecha es obligatoria.");
      return;
    }

    if (!form.category) {
      setFormError("Debes elegir una categoria.");
      return;
    }

    const normalizedExpense = {
      id: editingId ?? Date.now(),
      description: form.description.trim(),
      amount: Number(form.amount),
      category: form.category,
      date: form.date,
    };

    setData((current) => {
      const expensesList = editingId
        ? current.expenses.map((expense) => (expense.id === editingId ? normalizedExpense : expense))
        : [normalizedExpense, ...current.expenses];

      return {
        ...current,
        expenses: expensesList,
      };
    });

    resetForm();
    setCurrentView("gastos");
  }

  function handleEditExpense(expense) {
    setEditingId(expense.id);
    setForm({
      id: expense.id,
      description: expense.description,
      amount: String(expense.amount),
      category: expense.category,
      date: expense.date,
    });
    setFormError("");
    setCurrentView("nuevo");
  }

  function handleDeleteExpense(expenseId) {
    setData((current) => ({
      ...current,
      expenses: current.expenses.filter((expense) => expense.id !== expenseId),
    }));

    if (editingId === expenseId) {
      resetForm();
    }
  }

  function handleCancelEdit() {
    resetForm();
  }

  function handleCategorySubmit(event) {
    event.preventDefault();

    const normalizedCategory = categoryDraft.trim();

    if (!normalizedCategory) {
      setCategoryError("Escribe un nombre de categoria.");
      return;
    }

    if (data.categories.some((category) => category.toLowerCase() === normalizedCategory.toLowerCase())) {
      setCategoryError("La categoria ya existe.");
      return;
    }

    setData((current) => ({
      ...current,
      categories: [...current.categories, normalizedCategory],
    }));
    setCategoryDraft("");
    setCategoryError("");
  }

  function handleDeleteCategory(categoryName) {
    if ((usageByCategory[categoryName] ?? 0) > 0) {
      setCategoryError("No puedes eliminar una categoria con gastos asociados.");
      return;
    }

    const nextCategories = data.categories.filter((category) => category !== categoryName);

    setData((current) => ({
      ...current,
      categories: nextCategories.length ? nextCategories : current.categories,
    }));

    if (nextCategories.length && form.category === categoryName) {
      setForm((current) => ({ ...current, category: nextCategories[0] }));
    }

    setCategoryError(nextCategories.length ? "" : "Debe existir al menos una categoria.");
  }

  return (
    <div className="mobile-app-shell">
      <div className="phone-frame">
        <ActiveView
          categories={data.categories}
          categoryDraft={categoryDraft}
          categoryError={categoryError}
          categorySeries={categorySeries}
          currentMonth={currentMonth}
          currentView={currentView}
          expenses={expenses}
          form={form}
          formError={formError}
          isEditing={Boolean(editingId)}
          monthlySeries={monthlySeries}
          monthlyTotal={monthlyTotal}
          onCancelEdit={handleCancelEdit}
          onCategoryDraftChange={(event) => setCategoryDraft(event.target.value)}
          onCategorySubmit={handleCategorySubmit}
          onDeleteCategory={handleDeleteCategory}
          onDeleteExpense={handleDeleteExpense}
          onEditExpense={handleEditExpense}
          onExpenseChange={handleExpenseChange}
          onExpenseSubmit={handleExpenseSubmit}
          onNavigate={setCurrentView}
          totalSpent={totalSpent}
          usageByCategory={usageByCategory}
        />
        <BottomNav currentView={currentView} onNavigate={setCurrentView} />
      </div>
    </div>
  );
}
