import { Card, DonutChart, Title, List, ListItem } from "@tremor/react";

interface SavingsBreakdownProps {
    recommendations: any[];
    zombies: any[];
}

const valueFormatter = (number: number) =>
    `$ ${Intl.NumberFormat("us").format(number).toString()}`;

export default function SavingsBreakdown({ recommendations, zombies }: SavingsBreakdownProps) {
    let rightsizingSavings = 0;
    recommendations?.forEach(r => {
        if (r.cost_savings) rightsizingSavings += Math.abs(r.cost_savings.amount_per_month);
    });

    let zombieSavings = 0;
    zombies?.forEach(z => {
        if (z.estimated_monthly_waste) zombieSavings += z.estimated_monthly_waste;
    });

    const data = [
        { name: "Rightsizing", value: rightsizingSavings },
        { name: "Zombie Resources", value: zombieSavings },
    ];

    return (
        <Card className="max-w-lg">
            <Title>Potential Savings Breakdown</Title>
            <DonutChart
                className="mt-6"
                data={data}
                category="value"
                index="name"
                valueFormatter={valueFormatter}
                colors={["emerald", "rose"]}
            />
            <List className="mt-6">
                {data.map((item) => (
                    <ListItem key={item.name}>
                        <span>{item.name}</span>
                        <span>{valueFormatter(item.value)}</span>
                    </ListItem>
                ))}
            </List>
        </Card>
    );
}
