package com.nt.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MenuAction {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;
    private String actionName;

    @ManyToOne
    @JoinColumn(name = "menu_item_id")
    private MenuItem menuItem;
}
