using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Windows.Forms;
using Pass.Dialogs;

namespace Pass.Forms;

public class SimpleList : Form
{
	private List<Client> _clients = new List<Client>();

	private IContainer components;

	private ListView ClientsList;

	private ColumnHeader FullName;

	private ColumnHeader CalledName;

	private ColumnHeader DateOfBirth;

	private Button AddBtn;

	private Button GenerateChartBtn;

	private Button MultiChartBtn;

	public SimpleList()
	{
		InitializeComponent();
		RefreshClientsList();
	}

	private void AddBtn_Click(object sender, EventArgs e)
	{
		Client client = EditDialog.AddClient(this, simple: true);
		if (client != null)
		{
			_clients.Add(client);
			RefreshClientsList();
		}
	}

	private void RefreshClientsList()
	{
		ClientsList.Items.Clear();
		_clients.ForEach(delegate(Client client)
		{
			ClientsList.Items.Add(new ListViewItem(new string[3] { client.FullName, client.CalledName, client.Dob }));
		});
	}

	private void ClientsList_ItemChecked(object sender, ItemCheckedEventArgs e)
	{
		MultiChartBtn.Enabled = ClientsList.CheckedItems.Count > 1;
	}

	private void GenerateChartBtn_Click(object sender, EventArgs e)
	{
		QuickForm quickForm = new QuickForm();
		ListViewItem listViewItem = ClientsList.Items[ClientsList.SelectedIndices[0]];
		quickForm.SetDetails(listViewItem.Text, listViewItem.SubItems[2].Text);
		quickForm.Show();
	}

	private void ClientsList_SelectedIndexChanged(object sender, EventArgs e)
	{
		GenerateChartBtn.Enabled = ClientsList.SelectedIndices.Count > 0;
	}

	private void MultiChartBtn_Click(object sender, EventArgs e)
	{
		MultiChart multiChart = new MultiChart();
		foreach (ListViewItem checkedItem in ClientsList.CheckedItems)
		{
			multiChart.AddClient(checkedItem.SubItems[0].Text, checkedItem.SubItems[2].Text);
		}
		multiChart.Show();
	}

	protected override void Dispose(bool disposing)
	{
		if (disposing && components != null)
		{
			components.Dispose();
		}
		base.Dispose(disposing);
	}

	private void InitializeComponent()
	{
		System.Windows.Forms.ListViewItem listViewItem = new System.Windows.Forms.ListViewItem(new string[3] { "Roman Peter Vaughan", "Roman Vaughan", "24/05/1992" }, -1);
		System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(Pass.Forms.SimpleList));
		this.ClientsList = new System.Windows.Forms.ListView();
		this.FullName = new System.Windows.Forms.ColumnHeader();
		this.CalledName = new System.Windows.Forms.ColumnHeader();
		this.DateOfBirth = new System.Windows.Forms.ColumnHeader();
		this.AddBtn = new System.Windows.Forms.Button();
		this.GenerateChartBtn = new System.Windows.Forms.Button();
		this.MultiChartBtn = new System.Windows.Forms.Button();
		base.SuspendLayout();
		this.ClientsList.Anchor = System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Left | System.Windows.Forms.AnchorStyles.Right;
		this.ClientsList.CheckBoxes = true;
		this.ClientsList.Columns.AddRange(new System.Windows.Forms.ColumnHeader[3] { this.FullName, this.CalledName, this.DateOfBirth });
		this.ClientsList.FullRowSelect = true;
		listViewItem.StateImageIndex = 0;
		this.ClientsList.Items.AddRange(new System.Windows.Forms.ListViewItem[1] { listViewItem });
		this.ClientsList.Location = new System.Drawing.Point(0, 0);
		this.ClientsList.MultiSelect = false;
		this.ClientsList.Name = "ClientsList";
		this.ClientsList.Size = new System.Drawing.Size(615, 254);
		this.ClientsList.Sorting = System.Windows.Forms.SortOrder.Ascending;
		this.ClientsList.TabIndex = 0;
		this.ClientsList.UseCompatibleStateImageBehavior = false;
		this.ClientsList.View = System.Windows.Forms.View.Details;
		this.ClientsList.ItemChecked += new System.Windows.Forms.ItemCheckedEventHandler(ClientsList_ItemChecked);
		this.ClientsList.SelectedIndexChanged += new System.EventHandler(ClientsList_SelectedIndexChanged);
		this.FullName.Text = "Full Name";
		this.FullName.Width = 286;
		this.CalledName.Text = "Called Name";
		this.CalledName.Width = 192;
		this.DateOfBirth.Text = "Date of Birth";
		this.DateOfBirth.Width = 120;
		this.AddBtn.Anchor = System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Left;
		this.AddBtn.Location = new System.Drawing.Point(12, 260);
		this.AddBtn.Name = "AddBtn";
		this.AddBtn.Size = new System.Drawing.Size(75, 23);
		this.AddBtn.TabIndex = 1;
		this.AddBtn.Text = "&Add";
		this.AddBtn.UseVisualStyleBackColor = true;
		this.AddBtn.Click += new System.EventHandler(AddBtn_Click);
		this.GenerateChartBtn.Anchor = System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right;
		this.GenerateChartBtn.Enabled = false;
		this.GenerateChartBtn.Location = new System.Drawing.Point(520, 260);
		this.GenerateChartBtn.Name = "GenerateChartBtn";
		this.GenerateChartBtn.Size = new System.Drawing.Size(83, 23);
		this.GenerateChartBtn.TabIndex = 2;
		this.GenerateChartBtn.Text = "View &Chart";
		this.GenerateChartBtn.UseVisualStyleBackColor = true;
		this.GenerateChartBtn.Click += new System.EventHandler(GenerateChartBtn_Click);
		this.MultiChartBtn.Anchor = System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right;
		this.MultiChartBtn.Enabled = false;
		this.MultiChartBtn.Location = new System.Drawing.Point(431, 260);
		this.MultiChartBtn.Name = "MultiChartBtn";
		this.MultiChartBtn.Size = new System.Drawing.Size(83, 23);
		this.MultiChartBtn.TabIndex = 3;
		this.MultiChartBtn.Text = "&Multi Chart";
		this.MultiChartBtn.UseVisualStyleBackColor = true;
		this.MultiChartBtn.Click += new System.EventHandler(MultiChartBtn_Click);
		base.AutoScaleDimensions = new System.Drawing.SizeF(6f, 13f);
		base.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
		base.ClientSize = new System.Drawing.Size(615, 295);
		base.Controls.Add(this.MultiChartBtn);
		base.Controls.Add(this.GenerateChartBtn);
		base.Controls.Add(this.AddBtn);
		base.Controls.Add(this.ClientsList);
		base.Icon = (System.Drawing.Icon)resources.GetObject("$this.Icon");
		base.Name = "SimpleList";
		this.Text = "Pass";
		base.ResumeLayout(false);
	}
}
