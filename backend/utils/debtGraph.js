/**
 * Simplifies debts within a group.
 * @param {Array} members - List of User objects or IDs in the group.
 * @param {Array} expenses - List of Expense objects populated with paid_by and split_details.
 * @returns {Array} - List of simplified transactions [{ from: userId, to: userId, amount: Number }]
 */
const simplifyDebts = (members, expenses) => {
    const balances = {};

    // Initialize balances
    members.forEach(member => {
        const id = member._id ? member._id.toString() : member.toString();
        balances[id] = 0;
    });

    // Calculate net balances
    expenses.forEach(expense => {
        const paidBy = expense.paid_by._id ? expense.paid_by._id.toString() : expense.paid_by.toString();

        // Add amount paid by payer (credit)
        if (balances[paidBy] !== undefined) {
            // We only track the NET relative to the group. 
            // Actually, easier: For each expense, whoever paid gets +amount. 
            // Whoever owes gets -amount.
            // But 'amount' in expense is total. 
            // Does split_details sum to amount? Usually yes.
            // Let's rely on split_details.
        }

        expense.split_details.forEach(split => {
            const debtor = split.user._id ? split.user._id.toString() : split.user.toString();
            const amount = split.amount_owed;

            if (balances[debtor] !== undefined) {
                balances[debtor] -= amount;
            }
            if (balances[paidBy] !== undefined) {
                balances[paidBy] += amount;
            }
        });
    });

    // Separate into debtors and creditors
    let debtors = [];
    let creditors = [];

    Object.keys(balances).forEach(userId => {
        const balance = balances[userId];
        // Floating point safety - ignore very small amounts
        if (balance < -0.01) {
            debtors.push({ userId, amount: balance }); // amount is negative
        } else if (balance > 0.01) {
            creditors.push({ userId, amount: balance });
        }
    });

    // Sort by magnitude (largest debt/credit first) - heuristic for fewer edges
    debtors.sort((a, b) => a.amount - b.amount); // Ascending (since negative, most negative first)
    creditors.sort((a, b) => b.amount - a.amount); // Descending (most positive first)

    const transactions = [];

    // Greedy matching
    let i = 0; // debtors index
    let j = 0; // creditors index

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];

        // The amount to settle is the minimum of (abs(debt), credit)
        const amount = Math.min(Math.abs(debtor.amount), creditor.amount);

        // Record transaction
        transactions.push({
            from: debtor.userId,
            to: creditor.userId,
            amount: Number(amount.toFixed(2))
        });

        // Update remaining balances
        debtor.amount += amount;
        creditor.amount -= amount;

        // Move pointers if settled
        if (Math.abs(debtor.amount) < 0.01) {
            i++;
        }
        if (creditor.amount < 0.01) {
            j++;
        }
    }

    return transactions;
};

module.exports = simplifyDebts;
